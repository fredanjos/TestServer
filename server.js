const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const validator = require("validator");

const app = express();
const port = 3000;
var port = process.env.PORT || 3000

//#region ##### CONFIG #####
const config = {
    host: "db4free.net",
    user: "node_guaru",
    password: "fred2505",
    database: "node_guaru",
    port: 3306,
};

var connection = mysql.createConnection(config);

connection.connect(function (err) {
    if (err) {
        console.log("Error " + err);
        return;
    } else {
        console.log("Esta ok com id: " + connection.threadId);
    }

});
//#endregion

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

//#region  ##### GET #####
app.get("/", function (req, res) {
    console.log("Passando no GET");
    res.send("Welcome");
});

app.get("/login/:email/:password", function (req, res) {
    console.log("Passando no GET/LOGIN");

    var erro = false;

    var msgRes = {};
    msgRes.status = 200;
    msgRes.message = "";

    var status_code = 200;
    var msg_text = "";

    var loginTemp = {};
    loginTemp.email = req.params.email;
    loginTemp.password = req.params.password;

    if (!validator.isEmail(loginTemp.email)) {
        console.log("Passando no login email com formato errado");
        status_code = 400;
        msg_text = "Email com formato invalido";
        erro = true;
    }

    if (!erro) {
        //Consulta no banco de dados
        //SELECT    
        login_select(loginTemp).then((result) => {
            console.log("login select then");

            //caso não retorne dados compativeis com email e senha
            if (parseInt(result.length) == 0) {
                console.log("login select then não teve resultado compativel");
                status_code = 400;
                msg_text = "Login ou senha incorretos";
            }

            //Caso tenha registro duplicados
            if (parseInt(result.length) > 1) {
                console.log("login select then teve resultado maior do que o compativel");
                status_code = 400;
                msg_text = "Existe um problema com seus dados entre em contato!";
            }

            //Devolvendo resposta
            msgRes.status = status_code;
            msgRes.message = msg_text;
            // Retorno da menssagen para usario
            res.status(msgRes.status).json(msgRes);

        }).catch((err) => {
            console.log("login select cacth");

            if (err) {
                msgRes.status = err.status_code;
                msgRes.message = err.msg_text;
            }
            else {
                msgRes.status = 500;
                msgRes.message = "Não é possivel acessar tente novamente em breve!";


            }

            console.log("login select cacth err: " + msgRes.message);
            // Retorno da menssagen para usario
            res.status(msgRes.status).json(msgRes);
        });
    }
    else {
        msgRes.status = status_code;
        msgRes.message = msg_text;
        res.status(msgRes.status).json(msgRes);
    }
});

//#endregion

//#region ##### POST ####

app.post("/register", function (req, res) {
    console.log("Passando no Post/Register");

    var erro = false;

    var msgRes = {};
    msgRes.status = 200;
    msgRes.message = "";

    var status_code = 200;
    var msg_text = "";

    var registerTemp = {};
    registerTemp = req.body;

    if (!validator.isEmail(registerTemp.email)) {
        console.log("Passando no register email com formato errado");
        status_code = 400;
        msg_text = "Email com formato errado";
        erro = true;
    }

    if (!erro) {
        // Cadastro no banco de dados
        register_select(registerTemp).then((result) => {
            console.log("register select then result");
            //caso já exista email cadastrado
            if (parseInt(result.length) > 0) {
                console.log("register select then já tem email cadastrado");
                status_code = 400;
                msg_text = "Email já esta cadastrado";
                //Devolvendo resposta
                msgRes.status = status_code;
                msgRes.message = msg_text;
                // Retorno da menssagen para usuario
                res.status(msgRes.status).json(msgRes);
            }
            else {
                register_insert(registerTemp).then((result2) =>{
                    console.log("register insert then result");
                    msgRes.status = status_code;
                    msgRes.message = msg_text;
                    //retoran mensegem para usuario
                    res.status(msgRes.status).json(msgRes);

                }).catch((err2) =>{
                    console.log("register insert cacth erro")
                    msgRes.status = err2.status_code;
                    msgRes.message = err2.msg_text;
                    //retoran mensegem para usuario
                    res.status(msgRes.status).json(msgRes);
                });
                console.log("Final do register select tinha que passar no insert");
            }

        }).catch((err) => {
            console.log("register select cacth erro");

            if (err) {
                msgRes.status = err.status_code;
                msgRes.message = err.msg_text;
            }
            else {
                msgRes.status = 500;
                msgRes.message = "Não é possivel acessar tente novamente em breve!";
            }

            console.log("register select cacth err: " + msgRes.message);
            // Retorno da menssagen para usario
            res.status(msgRes.status).json(msgRes);
        });
    }
    else {
        msgRes.status = status_code;
        msgRes.message = msg_text;
        res.status(msgRes.status).json(msgRes);
    }
});

//#endregion

//#region ##### FUNCTIONS #####

// #### LOGIN
function login_select(login_temp) {
    return new Promise((resolve, reject) => {

        connection.query(`SELECT * FROM login WHERE email = '${login_temp.email}' AND password = '${login_temp.password}'`, function (err, results, filed) {

            var obj_err = {};
            obj_err.msg_text = "--->>> login select - não entrou no erro ainda";

            if (err) {
                console.log("Erro login select dentro da promise: " + err);
                obj_err.status_code = 400;
                obj_err.msg_text = err;
                reject(obj_err);
            }
            else {
                console.log("Dentro da promise selecionado: " + results.length);
                resolve(results);
            }
        })

    });
}

//#### REGISTER
function register_select(register_temp) {
    return new Promise((resolve, reject) => {

        connection.query(`SELECT * FROM login WHERE email = '${register_temp.email}' `, function (err, results, filed) {

            var obj_err = {};
            obj_err.msg_text = "--->>> register select - não entrou no erro ainda";

            if (err) {
                console.log("Erro register select dentro da promise: " + err);
                obj_err.status_code = 400;
                obj_err.msg_text = err;
                reject(obj_err);
            }
            else {
                console.log("Dentro da promise selecionado: " + results.length);
                resolve(results);
            }
        });
    });
}

function register_insert(register_temp) {
    return new Promise((resolve, reject) => {

        connection.query(`INSERT INTO login (email, password) VALUES ('${register_temp.email}','${register_temp.password}')`, function (err, results, filed) {

            var obj_err = {};
            obj_err.msg_text = "--->>> register insert - não entrou no erro ainda";

            if (err) {
                console.log("Erro register insert dentro da promise: " + err);
                obj_err.status_code = 400;
                obj_err.msg_text = err;
                reject(obj_err);
            }
            else {
                console.log("Dentro da promise inserida linhas afetadas: " + results.length);
                resolve(results);
            }
        });
    });
}
//#endregion

app.listen(port, function () {
    console.log("Servidor escutando a porta " + port);
});
