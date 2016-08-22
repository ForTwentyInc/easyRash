""" Implements models used in api/views """
import os
import time
import datetime
import json
import logging
import types
from flask_login import current_user
import lxml.html
from lxml import etree

logger = logging.getLogger(__name__)


class User():
    def __init__(self, ID, name, f_name, mail, pwd, sex):
        """Populates an user instance"""

        self.Id = ID
        self.Name = name
        self.F_Name = f_name
        self.Email = mail
        self.Pass = pwd
        self.Sex = sex
        self.Roles = []
        # search for an UID in events and set his roles
        with open('project-files/events.json', 'r') as data:
            Events = json.load(data)
        for elem in Events:
            for ch in elem['chairs']:
                if ID == ch and 'chair' not in self.Roles:
                    self.Roles.append('chair')
            for doc in elem['submissions']:
                if ID in doc['reviewers'] and 'reviewer' not in self.Roles:
                    self.Roles.append('reviewer')
                    break

    @property
    def is_authenticated(self):
        return True

    @property
    def is_active(self):
        return True

    @property
    def is_anonymous(self):
        return False

    def get_id(self):
        return unicode(self.Id)

    def GetMail(self):
        mail = str(self.Email)
        return mail

    def Get_Roles(self):
        return self.Roles

    def SetPassword(self, password):
        """takes a password and updates the users file"""
        try:
            with open('project-files/users.json', 'r') as fh:
                UData = json.load(fh)
        except:
            logger.exception("User: can't open users.json")
        UData[self.Id]['pass'] = password
        try:
            with open('project-files/users.json', 'w') as fh:
                json.dump(UData, fh, indent=1, encoding='utf-8')
        except:
            logger.exception("User: can't update users.json")


class Document():
    def __init__(self, title, authors, url, reviewers, chairs):
        """ Populates Document class

        self.Status --- can be underreview (default), awaiting_decision, accepted, rejected
        self.Saved --- contains a list of the users that already saved their annotation"""
        self.Title = title
        self.Authors = authors
        self.Url = "project-files/dataset/" + url
        self.Chairs = chairs
        self.Reviewers = set(reviewers) # cast to set to facilitate comparing
        try:
            with open('project-files/documents.json', 'r') as fh:
                DocData = json.load(fh)
                self.Status = DocData[self.Title]['status']
                self.Saved = set(DocData[self.Title]['saved']) # cast to set to facilitate comparing
        except IOError:
            logger.exception("Can't read documents.json")

    def GetAuthors(self):
        return self.Authors

    def GetReviewers(self):
        """ returns a list of names"""
        Tmp = []
        for elem in list(self.Reviewers):
            Words = elem.split()
            Words.pop()
            elem = ' '.join(Words)
            Tmp.append(elem)
        return Tmp

    def GetSaved(self):
        """ returns a list of names"""
        Tmp = []
        for elem in list(self.Saved):
            Words = elem.split()
            Words.pop()
            elem = ' '.join(Words)
            Tmp.append(elem)
        return Tmp

    def Lock(self, u_id):
        """ Takes UID and sets the lock, , ret a dict carrying lock's info"""
        path = 'project-files/lock.json'
        with open(path, 'r') as fh:
            tmp_Data = json.load(fh)
            for elem in tmp_Data:
                if elem['title'] == self.Title:
                    elem['u_id'] = u_id
                    elem['Lock'] = True
                    break
        with open(path, 'w') as fh:
            json.dump(tmp_Data, fh, encoding='utf-8')
        return elem

    def Unlock(self, u_id):
        """ Takes UID and unlocks if UID has the lock, ret a dict carrying lock's info"""
        path = 'project-files/lock.json'
        with open(path, 'r') as fh:
            tmp_Data = json.load(fh)
            for elem in tmp_Data:
                if elem['title'] == self.Title and elem['u_id'] == u_id:
                    elem['Lock'] = False
                    break
        with open(path, 'w') as fh:
            json.dump(tmp_Data, fh, encoding='utf-8')
        return elem

    def IsLocked(self):
        """ Returns lock's info """
        path = 'project-files/lock.json'
        with open(path, 'r') as fh:
            tmp_Data = json.load(fh)
            for elem in tmp_Data:
                if elem['title'] == self.Title:
                    return elem

    def SetSaved(self, ID, decision=None):
        """ Takes an UID and a decision and adds the UID to documents.json

        If a decison is present and the user is chair self.Status is updated
        If all reviewers saved self.Status is set to awaiting_decision"""
        try:
            with open('project-files/documents.json', 'r') as fh:
                DocData = json.load(fh)
        except IOError:
            logger.exception("Doc.SetSaved: Can't read documents.json")
        if ID not in self.Saved:
            if decision is not None and ID in self.Chairs:
                logger.info('a chair decided: %s', decision)
                DocData[self.Title]['status'] = decision
            else:
                DocData[self.Title]['saved'].append(ID)
                if set(DocData[self.Title]['saved']) == self.Reviewers and DocData[self.Title]['status'] == 'underreview':
                    DocData[self.Title]['status'] = 'awaiting_decision'
        else:
            if decision is not None and ID in self.Chairs:
                logger.info('a chair decided: %s', decision)
                DocData[self.Title]['status'] = decision
        try:
            with open('project-files/documents.json', 'w') as fh:
                json.dump(DocData, fh, indent=2, encoding='utf-8')
            logger.info('%s saved', ID)
        except IOError:
            logger.exception("Doc.SetSaved: Can't update documents.json")


    def GetBody(self):
        """returns body of self, changing imgs sources to show them in ann mode"""
        try:
            t = lxml.html.parse(self.Url) # parses a doc returns a DOM-like tree
        except:
            logger.exception("can't parse %s", self.Url)
        t_root = t.getroot()
        for child in t_root.iterdescendants():
            if child.tag == 'img': # add project-files/dataset to imgs src to show images in ann mode
                child.set('src', '/project-files/dataset/' + child.attrib['src'])
        body = t.xpath('//body')
        body_text = ""
        for child in body:
            body_text += etree.tostring(child) # stringify all body children
        return body_text

    def UpdateBody(self, nbody):
        """ takes an HTML string representing new self body, fixes imgs paths and writes to file

        returns 201 if OK
        else 400"""
        new_body = lxml.html.fragment_fromstring(nbody, create_parent='body')
        for elem in new_body.iterdescendants(): # iter in descendants of body looking for imgs
            if elem.tag == 'img':
                elem.set('src', elem.attrib['src'].replace('/project-files/dataset/', '')) #fixes img paths
        try:
            t = lxml.html.parse(self.Url)
            t_root = t.getroot()
        except:
            logger.exception("Can't parse %s", self.Url)
        for elem in t_root.iterdescendants(): # iter in descendants of root looking for body and imgs
            if elem.tag == 'body':
                par = elem.getparent()
                par.replace(elem, new_body) # replaces body
                logger.info('%s body replaced', self.Url)
                break
        try:
            with open(self.Url, 'w') as fh:
                fh.write(etree.tostring(t, pretty_print=True, encoding='UTF-8')) # writes changes to file
                return 201
        except:
            logger.exception("Can't update %s body", self.Url)
            return 400

    def AddAnnotation(self, anndata):
        """ takes a dict and creates a new annotation

        anndata_example = {
                            type: review/decision
                            score: 1-5
                            status: foo
                            global: bar
                            LocalStorage:
                                if type == review [{annotation: barfoo, date: YY/MM/DD - hh:mm:ss, id:FooBarX}]
                                else []
        }

        returns 201 if OK
        404 else
        """
        try:
            Tree = lxml.html.parse(self.Url) # parses a doc returns a DOM-like tree
        except:
            logger.exception("Couldn't parse %s", self.Url)
            return 404
        if anndata['type'] == 'review':
            LStorage = json.loads(anndata['LocalStorage'])
        FullJson = []
        Scr = self.GetAnnotations()
        if Scr is None:
            ScrptInd = 1
        else:
            ScrptInd = len(Scr) + 1 # number of annotations already saved +1
        Now = datetime.datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S')
        Author = person
        Author['@id'] = 'mailto:' + current_user.Email
        Author['name'] = current_user.Name + ' ' + current_user.F_Name
        Author['as']['@id'] = '#role' + str(ScrptInd)
        if anndata['type'] == 'review':
            Author['as']['role_type'] = "pro:reviewer"
            NewAnn = {
                        "@context": "http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json",
                        "@type": 'review',
                        "@id": '#review' + str(ScrptInd),
                        "article": {
                                    "@id": "",
                                    "eval": {
                                            "@id": '#review' + str(ScrptInd) + '-eval',
                                            "@type": "score",
                                            "status": anndata['status'],
                                            "score": anndata['score'],
                                            "author": 'mailto:' + current_user.Email,
                                            "date": Now,
                                            'global': anndata['global']
                                            }
                                    },
                        "comments": []
                        }
            i = 1
            FullJson.append(NewAnn)
            for comm in LStorage:
                new_comm = {
                                "@context": "http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json",
                                "@type": "comment",
                                "@id": NewAnn['@id'] + '-c' + str(i),
                                "text": comm['annotation'],
                                "ref": '#' + comm['id'],
                                "author": Author['@id'],
                                "date": comm['date']
                            }
                FullJson[0]['comments'].append(new_comm['@id'])
                for elem in Tree.xpath('//span'):
                    if elem.get('id') == comm['id']:
                        elem.set('class', 'saved') # sets unsaved comment to saved
                i = i + 1
                FullJson.append(new_comm)
        elif anndata['type'] == 'decision':
            Author['as']['role_type'] = "pro:chair"
            NewAnn = {
                        "@context": "http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json",
                        "@type": 'decision',
                        "@id": '#decision' + str(ScrptInd),
                        "article": {
                                    "@id": "",
                                    "eval": {
                                            "@id": '#decision' + str(ScrptInd) + '-eval',
                                            "@type": "score",
                                            "status": anndata['status'],
                                            "score": anndata['score'],
                                            "author": 'mailto:' + current_user.Email,
                                            "date": Now,
                                            'global': anndata['global']
                                            }
                                    },
                        }
            FullJson.append(NewAnn)
        FullJson.append(Author)
        NewElem = etree.Element('script') # creates the new script Element
        NewElem.attrib['type'] = 'application/ld+json'
        NewElem.text = json.dumps(FullJson, indent=2)
        Scr = Tree.xpath("//script[@type='application/ld+json']")
        if len(Scr) > 0: # checks if another annotations is already present
            LastScript = Scr[-1]
        else:
            LastScript = Tree.find('head').getchildren()[-1] # selects the last child of head
        LastScript.addnext(NewElem)
        if anndata['type'] == 'review':
            LastScript.addnext(etree.Comment(" Review by " + Author['@id']))
        elif anndata['type'] == 'decision':
            LastScript.addnext(etree.Comment(" Decision by " + Author['@id']))
        #adds the element as the next sibling of LastScript
        try:
            with open(self.Url, 'w') as fh:
                fh.write(etree.tostring(Tree, pretty_print=True, encoding='UTF-8')) # writes tree to file
        except IOError:
            logger.exception("Can't update %s, 404", self.Url)
            return 404
        if anndata['type'] == 'decision':
            self.SetSaved(current_user.get_id(), anndata['status']) # adds curr_usr to saved
        else:
            self.SetSaved(current_user.get_id())
        return 201

    def GetAnnotations(self, UMail=None):
        """ if UMail is given returns UMail's Annotation
        else returns a list of all annotations
        returns None on failure"""
        try:
            text = lxml.html.parse(self.Url)
            scr = text.xpath("//script[@type='application/ld+json']")
        except:
            logger.exception('Annotation not found')
            return None
        ann = []
        for x in range(len(scr)):
            data = json.loads(scr[x].text)
            try:
                if data[0]['@context'] == "http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json": # filters all json-ld that are not annotations
                    if UMail is not None:
                        email = 'mailto:'+ UMail
                        if data[-1]['@id'] == email and data[0]['@type'] == 'review':
                            return data
                    else:
                        ann.append(data)
            except KeyError:
                pass
        if ann:
            return ann
        else:
            return None

    def UpdateAnn(self, UMail, anndata):
        """ takes a dict containing annotation data and the email of the annotation's author

        anndata_example = {
                            type: ---> MUST BE update
                            id: id of the field that has to be updated i.e. '#review1'/'review1-c1'
                            score: 1-5
                            status: foo
                            global: bar
                            LocalStorage:
                                present if usr wants to add new comments
        }

        returns 201 if OK
        404 else
        """
        MyAnn = self.GetAnnotations(UMail)
        """global ,status, type , score , id"""
        if MyAnn is not None:
            Now = datetime.datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S')
            try:
                Tree = lxml.html.parse(self.Url)
                scr = Tree.xpath("//script[@type='application/ld+json']")
            except:
                logger.exception('Annotation not found')
            for elem in MyAnn:
                if anndata['id'] == elem['@id']:
                    if elem['@type'] == 'review':
                        elem['article']['eval']['global'] = anndata['global']
                        elem['article']['eval']['status'] = anndata['status']
                        elem['article']['eval']['score'] = anndata['score']
                        elem['article']['eval']['date'] = Now
                        if anndata['LocalStorage']:
                            LStorage = json.loads(anndata['LocalStorage'])
                            i = int((MyAnn[-2]['@id'].split('-'))[1].replace('c',''))
                            # selects the id of second last obj, splits and extracts the index casting to int
                            i = i + 1
                            for comm in LStorage:
                                new_comm = {
                                                "@context": "http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json",
                                                "@type": "comment",
                                                "@id": MyAnn[0]['@id'] + '-c' + str(i),
                                                "text": comm['annotation'],
                                                "ref": '#' + comm['id'],
                                                "author": MyAnn[0]['article']['eval']['author'],
                                                "date": comm['date']
                                            }
                                MyAnn[0]['comments'].append(new_comm['@id'])
                                for elem in Tree.xpath('//span'):
                                    if elem.get('id') == comm['id']:
                                        elem.set('class', 'saved') # sets unsaved comment to saved
                                i = i + 1
                                MyAnn.insert(-2, new_comm)
                        break
                    elif elem['@type'] == 'comment':
                        elem['text'] = anndata['annotation']
                        elem['date'] = anndata['date']
                        break
            for elem in scr:
                data = json.loads(elem.text)
                try:
                    if data[0]['@context'] == "http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json": # filters all json-ld that are not annotations
                        email = 'mailto:'+ UMail
                        if data[-1]['@id'] == email:
                            elem.text = json.dumps(MyAnn, indent=2)
                            try:
                                with open(self.Url, 'w') as fh:
                                    fh.write(etree.tostring(Tree, pretty_print=True, encoding='UTF-8')) # writes tree to file
                                return 201
                            except IOError:
                                logger.exception("Can't update %s, 404", self.Url)
                                return 404
                except KeyError:
                    pass
            return 404
        else:
            return 404


class Event():
    """ contains event info and a list of the docs submitted for that event"""
    def __init__(self, conference, acronym, chairs, members, submissions):
        self.Name = conference
        self.Acr = acronym
        self.Members = members
        self.Chairs = chairs
        self.Docs = []
        for elem in submissions:
            self.Docs.append(Document(elem['title'], elem['authors'], elem['url'], elem['reviewers'], self.Chairs))

    def GetDocs(self):
        return self.Docs

    def GetChairs(self):
        """ returns a list of names"""
        Tmp = []
        for elem in self.Chairs:
            Words = elem.split()
            Words.pop()
            elem = ' '.join(Words)
            Tmp.append(elem)
        return Tmp


class EventsHandler():
    """ Contains a list of Events """
    def __init__(self):
        self.Active_Events = []
        with open('project-files/events.json', 'r') as data:
            Events = json.load(data)
        for elem in Events:
            self.Active_Events.append(Event(elem['conference'],
                                            elem['acronym'],
                                            elem['chairs'],
                                            elem['pc_members'],
                                            elem['submissions']))

    def GetDocfromID(self, ID):
        """ Takes a document title and returns a Doc instance"""
        for Event in self.Active_Events:
            for Doc in Event.GetDocs():
                if ID == Doc.Title:
                    return Doc
        return None


person = {
            "@context": "http://vitali.web.cs.unibo.it/twiki/pub/TechWeb16/context.json",
            "@type": "person",
            "@id": "",
            "name": "",
            "as": {
                    "@id": "",
                    "@type": "role",
                    "role_type": "",
                    "in": ""
                    }
            }
