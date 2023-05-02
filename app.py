from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('marauder.jinja')

if __name__ == '__main__':
    #app.run(debug=True, ssl_context="adhoc", host='0.0.0.0')
    app.run()