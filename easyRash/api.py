""" implements APIs for easyRash"""
import logging
from flask import json, jsonify
from flask import url_for, g, request, make_response, abort
from flask_login import current_user, login_required
from easyRash import app
from .models import EventsHandler



logger = logging.getLogger(__name__)


E_Hand = EventsHandler()


@app.before_request
def before_request():
    """before every request handling sets the global object g.user to curr_usr if present"""
    g.user = current_user



@app.errorhandler(404)
def not_found(error):
    """ 404 json response """
    message = {
        'status': 404,
        'message': 'Not Found: ' + request.url}
    resp = jsonify(message)
    resp.status_code = 404
    return resp


@app.route('/api/user', methods=['GET', 'POST'])
@login_required
def CurrentUser():
    """ Used to read and update user info

    GET --- returns a json with curr_usr info, whitout the pass ;)
    POST --- takes a form to update curr_usr pass"""
    if request.method == 'GET':
        try:
            with open('project-files/users.json', 'r') as fh:
                UData = json.load(fh)
        except:
            logger.exception('ApiUser: couldnt read users.json')
        if UData[g.user.get_id()]:
            UData[g.user.get_id()].pop('pass')
            return jsonify({'User': UData[g.user.get_id()]})
        else:
            logger.warning('CurrentUser: User not found, 404')
            abort(404)
    else:
        if request.form['new_pass']:
            g.user.SetPassword(request.form['new_pass'])
            logger.info('%s changed the password', g.user.get_id())
            resp = jsonify({'Password': 'Updated'})
            resp.status_code = 200
            return resp
        else:
            abort(400)

@app.route('/api/documents', methods=['GET'])
def Documents():
    """ Checks curr_user role and returns his docs status in json """
    Ev = []
    for Event in E_Hand.Active_Events:
        EInfo = {}
        if g.user.get_id() in Event.Chairs or g.user.get_id() in Event.Members:
            EInfo.update({'acr': Event.Acr, "conf": Event.Name, 'chairs': Event.GetChairs()})
            status = []
            for Doc in Event.Docs:
                U_Rev = [rev for rev in Doc.GetReviewers() if rev not in Doc.GetSaved()]
                status.append({'url': Doc.Url, 'title': Doc.Title, 'status': Doc.Status, 'reviewers': Doc.GetReviewers(), 'saved': Doc.GetSaved(), 'underreview':U_Rev})
            EInfo.update({"docs": status})
            Ev.append(EInfo)
    if len(Ev):
        resp = make_response(json.dumps(Ev))
        resp.status_code = 200
        resp.mimetype = 'application/json'
        return resp
    else: abort(404)


@app.route('/api/documents/IsLocked', methods=['GET'])
def StateOfLock():
    """ Takes a title and returns a json with lock info"""
    ID = request.args.get("ID")
    Doc = E_Hand.GetDocfromID(ID)
    if Doc is not None:
        return jsonify(Doc.IsLocked())
    else:
        logger.warning('IsLocked: ID argument not found, 400')
        abort(400)


@app.route('/api/documents/Lock', methods=['GET'])
def Lock():
    """ Takes a title and if the doc is not locked by someone else gives the lock to curr_usr
    Returns a json obj = True if curr_usr got the locked, = False otherwise"""
    ID = request.args.get("ID")
    Doc = E_Hand.GetDocfromID(ID)
    if Doc is not None:
        state = Doc.IsLocked()['Lock']
        if not state:
            logger.info("%s locked %s", g.user.get_id(), Doc.Title)
            lock_info = Doc.Lock(g.user.get_id())['Lock']
            return jsonify({'Lock': lock_info})
        else:
            return jsonify({'Lock': state})
    else:
        logger.warning('Lock: ID argument not found, 400')
        abort(400)


@app.route('/api/documents/Unlock', methods=['GET'])
def Unlock():
    """ takes a title and if curr_usr had the lock releases the lock
    Returns a json obj = True if the lock is released, False otherwise"""
    ID = request.args.get("ID")
    Doc = E_Hand.GetDocfromID(ID)
    if Doc is not None:
        state = Doc.IsLocked()
        logger.info("document lock state: \n%s\n", json.dumps(state, indent=2))
        if state:
            logger.info("%s Unlocked %s", g.user.get_id(), Doc.Title)
            lock_info = not Doc.Unlock(g.user.get_id())['Lock']
            return jsonify({'Unlock': lock_info})
        else:
            return jsonify({'Unlock': state})
    else:
        logger.warning('Unlock: ID argument not found, 400')
        abort(400)


@app.route('/api/documents/body', methods=['GET', 'POST'])
def DocBody():
    """ Takes a title, used in Ann Mode to show a doc body and update it

    GET --- returns the body of selected doc
    POST --- returns a json with 200 if the body is updated"""
    if request.method == 'GET':
        ID = request.args.get('ID')
    else:
        ID = request.form['DocumentTitle']
    Doc = E_Hand.GetDocfromID(ID)
    if Doc is not None:
        if request.method == 'GET':
            body = Doc.GetBody()
            return jsonify({'Body': unicode(body)})

        elif request.method == 'POST':
            val = request.form['DocumentBody']
            val = val.strip('\n\t')
            state = Doc.UpdateBody(val)
            logger.info("%s Update Body -- state", state)
            if state == 201:
                resp = jsonify({'Body': 'Updated'})
                resp.status_code = 201
                resp.mimetype = 'application/json'
                return resp
            else:
                abort(400)
    else:
        logger.warning("documents/body DocTitle not found")
        abort(400)


@app.route('/api/comments', methods=['GET','POST'])
def MyAnnotations():
    """ Used to read and save annotations, takes a doc title

    GET --- returns a json containing all scripts with type json-ld
    POST --- takes a form, returns 200 if created
             This API is used by both reviewers and chair to save their comments"""
    if request.method == 'GET':
        ID = request.args.get('ID')
    elif request.method == 'POST':
        ID = request.form['IDdoc']
    Doc = E_Hand.GetDocfromID(ID)
    if Doc is not None:
        if request.method == 'GET':
            Ann = Doc.GetAnnotations()
            if Ann != None:
                return jsonify({'ann': Ann})
            else:
                abort(404)
        elif request.method == 'POST':
            AnnData = request.form
            logger.debug("request.form == \n\n%s", json.dumps(request.form, indent=2))
            if Doc.GetAnnotations(g.user.GetMail()) is not None and AnnData['type'] == 'update':
                ret = Doc.UpdateAnn(g.user.GetMail(),AnnData)
                logger.info("UpdAnnAPI ret: %s", ret)
            else:
                ret = Doc.AddAnnotation(AnnData)
                logger.info("AddAnnAPI ret: %s", ret)
            if ret == 201:
                resp = jsonify({'comment': 'created'})
                resp.status_code = 201
                resp.mimetype = 'application/json'
                return resp
            else: abort(404)
    else:
        logger.warning('/api/comments: ID argument not found, 400')
        abort(400)


@app.route('/api/comments/lastid', methods=['GET'])
def LastID():
    """ takes a doc title

    returns the last index of curr_usr review if present, else 0"""
    ID = request.args.get('ID')
    Doc = E_Hand.GetDocfromID(ID)
    if Doc is not None:
        MyAnn = Doc.GetAnnotations(g.user.GetMail())
        Name = g.user.Name + g.user.F_Name
        if MyAnn:
            lastid = 0
            for elem in MyAnn:
                if elem['@type'] == 'comment':
                    RefInd = elem['ref']
                    RefInd = RefInd.replace(Name, '')
                    if int(RefInd) > lastid:
                        lastid = int(RefInd)
            logger.info("%s lastid is %s",g.user.GetMail(),str(lastid))
            return jsonify({'lastid': lastid})
        else:
            logger.warning("lastidAPI -- %s has no annotations on %s",g.user.GetMail(), Doc.Url)
            return jsonify({'lastid': 0})
    else:
        logger.warning('lastid Get ID not found, 400')
        abort(400)
