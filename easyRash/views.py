"""Implements views, login and authentication for easyRash"""
import os
import logging
from flask import render_template, redirect, json, session, url_for, g
from flask import request, jsonify, abort
from flask_login import login_user, logout_user, current_user, login_required, LoginManager
from easyRash import app
from .models import User
logger = logging.getLogger(__name__)
login_manager = LoginManager() # used by flask login to handle login
login_manager.init_app(app)
login_manager.login_view = 'index'


@app.before_request
def before_request():
    """before every request handling sets the global object g.user to curr_usr if present"""
    if current_user:
        g.user = current_user


@login_manager.user_loader
def load_user(u_id):
    """ used by flask-login to load an User instance from an unicode id"""
    user = None
    with open('project-files/users.json', 'r') as data:
        users = json.load(data)
    for ID in users:
        if (unicode(ID) == u_id):
            user = User(unicode(ID), users[ID]['given_name'],
                        users[ID]['family_name'], users[ID]['email'],
                        users[ID]['pass'], users[ID]['sex'])
    return user


@app.route('/')
@app.route('/index')
def index():
    """/ redirects to /index: renders index.html"""
    if g.user is not None and g.user.is_authenticated:
        return redirect(url_for('home'))
    return render_template('index.html', title='Home')


@app.route('/register', methods=['POST'])
def register():
    """Takes a form encoded POST and creates a new user, redirects to Home"""
    Email = request.form['user']
    Password = request.form['pass']
    Name = request.form['name']
    F_Name = request.form['l_name']
    Sex = request.form['sex']
    UID = Name + ' ' + F_Name + ' ' + '<' + Email + '>'
    logger.info("new UID: %s", UID)
    AuthUser = None
    with open('project-files/users.json', 'r') as data:
        users = json.load(data) # load previous users data
    UJson = {UID: { 'given_name': Name,
                    'family_name': F_Name,
                    'email': Email,
                    'pass': Password,
                    'sex': Sex}}
    users.update(UJson)
    with open('project-files/users.json', 'w') as data:
        json.dump(users, data, encoding='utf-8', indent=2) # update the users file
    AuthUser = User(unicode(UID), Name, F_Name, Email, Password, Sex) # create a new instance to login
    login_user(AuthUser, remember=False)
    logger.info("new user %s registered", AuthUser.get_id())
    return redirect(url_for('home'))


@app.route('/login', methods=['POST'])
def login():
    """Takes a form encoded POST and authenticates an user instance, redirects to Home"""
    Username = request.form['user']
    Password = request.form['pass']
    AuthUser = None
    with open('project-files/users.json', 'r') as data:
        users = json.load(data)
    for ID in users:
        if (users[ID]['email'] == Username and users[ID]['pass'] == Password): # checks email+password
            AuthUser = User(unicode(ID), users[ID]['given_name'],
                             users[ID]['family_name'], users[ID]['email'],
                             users[ID]['pass'], users[ID]['sex'])
            break
    if AuthUser is not None:
        logger.info("auth user %s", AuthUser.get_id())
        login_user(AuthUser, remember=False)
        return redirect(url_for('home'))
    else:
        return redirect(url_for('index')), 403 # if no user is found


@app.route('/logout')
def logout():
    """ logout and releases lock"""
    if g.user is None:
        redirect(url_for('index'))
    logger.info("%s logged out", g.user.get_id())
    with open('project-files/lock.json', 'r') as fh:
        TmpData = json.load(fh)
    for elem in TmpData:
        if elem['Lock'] and elem['u_id'] == g.user.get_id():
            elem['Lock'] = False
            break
    with open('project-files/lock.json', 'w') as fh:
        json.dump(TmpData, fh, encoding='utf-8')
    logout_user()
    return redirect(url_for('index'))


@app.route('/home')
@login_required
def home():
    """renders home in reader mode"""
    return render_template('home.html', title="Reader", annotator=False, chair=False)

@app.route('/annotator')
@login_required
def annotator():
    """renders home in annotator mode"""
    logger.info("%s enter annotator", g.user.get_id())
    return render_template('annotator.html', title="Annotator", annotator=True, chair=False)
