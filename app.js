const express = require("express");
const bodyparser = require("body-parser");
const ejs = require("ejs");
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
  predictions: []
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
         prediction:[]
     });
     newpatient.save(function(err){
     	if(err){
     		console.log("error");
     	}
     	else{
     		res.redirect("/");
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
     		res.redirect("/");
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
  console.log(req.body);
  Patient.findOne({name:req.body.pname},function(err,foundUser){
    if(err){
      console.log(err);
    }
    else{
      if(foundUser){
        const now = new Date();
        const time=date.format(now, 'YYYY/MM/DD hh:mm:ss A [IST]',);
        const age =parseInt(req.body.age);
        const gender=parseInt(req.body.gridRadios);
        const chest=parseInt(req.body.chest);
        const rbp=parseInt(req.body.rbp);
        const choles=parseInt(req.body.cho);
        const sugar=parseInt(req.body.gridRadios1);
        const restecg=parseInt(req.body.restecg);
         const max=parseInt(req.body.max);
       const exercise=parseInt(req.body.gridRadios2);
       const depression=parseInt(req.body.depression);
       const stslope=parseInt(req.body.stslope);
       const vessels=parseInt(req.body.vessels);
       const thal=parseInt(req.body.thal);
      var spawn=require("child_process").spawn;
      var pythonProcess=spawn("python",["./proj.py",age,gender,chest,rbp,choles,sugar,restecg,max,exercise,depression,stslope,vessels,thal]);
      pythonProcess.stdout.on("data",function(data){
           var data=data.toString();
           d=data.split("");
           if(d[1]==='1'){
             const newprediction=new Prediction({
               name:req.body.pname,
               prediction:"low chance of heart disease",
               time:time
             });
             newprediction.save(function(err){
              if (err) {
                console.log(err);
              }
             });
             Patient.find({},function(err,result){
                res.render("doctor",{username:"",result:result});
             })
           }else{
             const newprediction=new Prediction({
               name:req.body.pname,
               prediction:"preety good chance of heart disease",
               time:time
             });
             newprediction.save(function(err){
              if (err) {
                console.log(err);
              }
             });
             Patient.find({},function(err,result){
                res.render("doctor",{username:"",result:result});
             })
           }
    });

      }
    }
  })
	

});
app.listen(3000,function(){
	console.log("server is running");
});
