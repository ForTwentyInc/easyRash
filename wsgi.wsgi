activate_this = '/home/web/site1615/html/flask/bin/activate_this.py'
execfile(activate_this, dict(__file__= activate_this))
# selecting and activating virtualenv
import sys, os

this_dir = os.path.dirname(os.path.abspath(__file__))

sys.path.insert(0, this_dir)
os.chdir(this_dir)


from easyRash import app as application
# init easyRash
