const express = require("express");
const bodyparser = require("body-parser");
const ejs = require("ejs");
const multer=require('multer');
const xlstojson=require("xls-to-json-lc");
const xlsxtojson=require("xlsx-to-json-lc");
const date = require('date-and-time');
const mongoose = require("mongoose");
const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({extended:true}));
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true,useUnifiedTopology: true ,useFindAndModify: false},);
const patientSchema = new mongoose.Schema ({
  name: String,
  password: String,
});
const doctorSchema = new mongoose.Schema ({
  name:String,
  password: String
});
const predictionSchema = new mongoose.Schema ({
  name:String,
  prediction:String,
  time:String
});
const Patient=new mongoose.model("Patient",patientSchema);
const Doctor = new mongoose.model("Doctor",doctorSchema);
const Prediction = new mongoose.model("Prediction",predictionSchema);
var storage = multer.diskStorage({ 
        destination: function (req, file, cb) {
            cb(null, './uploads/')
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
        }
    });
var upload = multer({
                    storage: storage,
                    fileFilter : function(req, file, callback) {
                        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
                            return callback(new Error('Wrong extension type'));
                        }
                        callback(null, true);
                    }
                }).single('file');
app.get("/",function(req,res){
	 res.sendFile(__dirname+"/starting.html");
});
app.post("/",function(req,res){
    if(req.body.value==="1"){
    	res.redirect("/patientregister");
    }
    if(req.body.value==="0"){
    	res.redirect("/doctorregister");
    }
});
app.get("/patientregister",function(req,res){
   res.sendFile(__dirname+"/signup.html");
});
app.post("/patientregister",function(req,res){
      
     const newpatient = new Patient({
         name:req.body.name,
         password:req.body.password,
     });
     newpatient.save(function(err){
     	if(err){
     		console.log("error");
     	}
     	else{
        Prediction.find({name:req.body.name},function(err,result){
             res.render("patient",{username:req.body.name,result:result});
          });
     	}
     });
});
app.get("/doctorregister",function(req,res){
	res.sendFile(__dirname+"/docsignup.html");
});
app.post("/doctorregister",function(req,res){
       const newdoctor = new Doctor({
         name:req.body.name,
         password:req.body.password
     });
     newdoctor.save(function(err){
     	if(err){
     		console.log("error");
     	}
     	else{
     		res.redirect("/login");
     	}
     });
});
app.get("/login",function(req,res){
        res.sendFile(__dirname+"/login.html");
});
app.post("/login",function(req,res){
        const username = req.body.name;
        const password = req.body.password;
        const value =req.body.value;
        if(value==="doctor"){
        	Doctor.findOne({name: username}, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          Patient.find({},function(err, result){
    if (err) throw err;
         res.render("doctor",{username:foundUser.name,result:result}); 
  });
        }
      }
    }
  });
       }
       else{
       	Patient.findOne({name: username}, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          Prediction.find({name:foundUser.name},function(err,result){
             res.render("patient",{username:foundUser.name,result:result});
          })
        }
      }
    }
  });
       }
});
app.post("/predict1",function(req,res){
   res.render("proj",{name:req.body.btn})
});
app.post("/predict",function(req,res){ 
  var exceltojson;
        upload(req,res,function(err){
            if(req.file.originalname.split('.')[req.file.originalname.split('.').length-1] === 'xlsx'){
                exceltojson = xlsxtojson;
            } else {
                exceltojson = xlstojson;
            }
            try {
                exceltojson({
                    input: req.file.path,
                    output: null, 
                    lowerCaseHeaders:true
                }, function(err,result){
                    for(var i=0;i<result.length;i++){
                         console.log(result[i])
                         const name = result[i].name;
                         const now = new Date();
                         const time=date.format(now, 'YYYY/MM/DD hh:mm:ss A [IST]',);
                         const age =parseInt(result[i].age);
                         const gender=parseInt(result[i].sex);
                         const chest=parseInt(result[i].cp);
                         const rbp=parseInt(result[i].trestbps);
                         const choles=parseInt(result[i].chol);
                         const sugar=parseInt(result[i].fbs);
                         const restecg=parseInt(result[i].restecg);
                         const max=parseInt(result[i].thalach);
                         const exercise=parseInt(result[i].exang);
                         const depression=parseInt(result[i].oldpeak);
                         const stslope=parseInt(result[i].slope);
                         const vessels=parseInt(result[i].ca);
                         const thal=parseInt(result[i].thal);
                         var spawn=require("child_process").spawn;
                        var pythonProcess=spawn("python",["./proj.py",age,gender,chest,rbp,choles,sugar,restecg,max,exercise,depression,stslope,vessels,thal,name]);
                        pythonProcess.stdout.on("data",function(data){
                              var data=data.toString();
                              d=data.split(",");
                              d=d[0].split(" ");
                              var name=d[1].replace("\r\n","");
                              console.log(name);
                             if(d[0]==='[1]'){
                             const newprediction=new Prediction({
                             name:name,
                             prediction:"low chance of heart disease",
                            time:time
                                });
                           newprediction.save(function(err){
                             if (err) {
                                console.log(err);
                                }
                               });

                             }else{
                         const newprediction=new Prediction({
                         name:name,
                         prediction:"preety good chance of heart disease",
                         time:time
                                 });
                        newprediction.save(function(err){
                          if (err) {
                         console.log(err);
                             } }); } }); };
                });
            } catch (e){
                res.json({error_code:1,err_desc:"Corupted excel file"});
            }
        })
           res.render("doctor",{username:""});
  
});
app.listen(3000,function(){
	console.log("server is running");
});
