var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs');
var db = mongojs('customerapp', ['users']);

var app = express();

/*
var logger = function(req, res, next){
  console.log('Logging now...');
  next();
}

app.use(logger);
*/


//EJS USAGE
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));




//body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// set static path
app.use(express.static(path.join(__dirname,'public')));

//Global Vars
app.use(function(request,response, next){
    response.locals.errors = null;
    next();
});

// In this example,
// the formParam value is going to
// get morphed into form body format useful for printing.
// EXPRESS VALIDATOR MIDDLEWARE
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
            , root    = namespace.shift()
            , formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg   : msg,
            value : value
        };
    }
}));

//DB'de tanımlı olmayan, burada tanımlanmış kullanıcılar için array
/*var users = [
    {
      id: 1,
        first_name: 'John',
        last_name: 'Doe',
        email: 'johndoe@gmail.com',
    },
    {
        id: 2,
        first_name: 'Kübra',
        last_name: 'Zeray',
        email: 'kubrazoray@gmail.com',
    },
    {
        id: 3,
        first_name: 'İsmail',
        last_name: 'Özsümer',
        email: 'ismozs@gmail.com',
    }
];*/


app.get('/', function(request,response){
    db.users.find(function (err, docs) {
        // docs is an array of all the documents in mycollection
        console.log(docs);
        response.render('index', {
            title: 'Customers',
            users: docs
        });
    });
  //response.send('Hello World 1 2 3');

  //JSON writer with response of the request
  //response.json(people);
});

app.post('/users/add', function(request, response){
    db.users.find(function (err, docs) {
        // Kural: İsim bölümünün boş geçilemeyeceği
        request.checkBody('first_name', 'First Name is Required').notEmpty();
        // Kural: Soyisim bölümünün boş geçilemeyeceği
        request.checkBody('last_name', 'Last Name is Required').notEmpty();
        // Kural: E-mail bölümünün boş geçilemeyeceği
        request.checkBody('email', 'E-mail is Required').notEmpty();
        // Kural: Re-Enter E-mail bölümünün boş geçilemeyeceği
        var remailFilled = request.checkBody('remail', 'Re-entering E-mail is Required').notEmpty();

/*        request.getValidationResult().then(function(result)){
            if(!result.include("E-mail is Required.")||!result.include("Re-entering E-mail is Required")){
        request.checkBody('remail', 'E-mail info should be the same.');
            }
        }*/

        var errors = request.validationErrors();

        if (errors) {
            response.render('index', {
                title: 'Customers',
                users: docs,
                errors: errors
            });
            console.log('VALIDATION ERROR');
        }
        else {
            var newUser = {
                first_name: request.body.first_name,
                last_name: request.body.last_name,
                email: request.body.email
            };
            //users.push(newUser);

            db.users.insert(newUser, function (err, result) {
                if (err) {
                    console.log(err);
                }
                result.redirect('/');

            });


            console.log('SUCCESSFULL SUBMITTION');
        }


    });

    //console.log(users);
});

app.listen(3001, function(){
  console.log('Server started on port 3001');
});