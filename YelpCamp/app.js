var express = require("express"),
	app = express(),
	bodyParser = require("body-parser"),
	mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/yelp_camp", {useNewUrlParser: true, useUnifiedTopology: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

// Schema setup 
var campgroundSchema = new mongoose.Schema({
	name: String,
	image: String,
	description: String
});

var Campground = mongoose.model("Campground", campgroundSchema);

// Campground.create(
// 	{
// 		name: "Granite Hill", 
// 		image: "https://images.pexels.com/photos/699558/pexels-photo-699558.jpeg?auto=compress&cs=tinysrgb&h=350",
// 		description: "This is a huge granite hill."
// 	}, function(err, campground){
// 	if(err){
// 		console.log(err);
// 	} else{
// 		console.log("newly created campground");
// 		console.log(campground);
// 	}
// });

// var campgrounds = [
// 		{name: "Salmon Creek", image:"https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&h=350"},
// 		{name: "Granite Hill", image:"https://images.pexels.com/photos/699558/pexels-photo-699558.jpeg?auto=compress&cs=tinysrgb&h=350"},
// 		{name: "Mountain Goat's Rest", image:"https://images.pexels.com/photos/1061640/pexels-photo-1061640.jpeg?auto=compress&cs=tinysrgb&h=350"}
// ];

app.get("/", function(req,res){
	res.render("landing");
});

//INDEX
app.get("/campgrounds", function(req,res){
	// res.render("campgrounds",{campgrounds:campgrounds});
	Campground.find({}, function(err, allcampgrounds){
		if(err){
			console.log(err);
		} else{
			res.render("index",{campgrounds:allcampgrounds})
		}
	})
});

//CREATE
app.post("/campgrounds", function(req, res){
	// get data from form and add to campgrounds array
	var name = req.body.name;
	var image = req.body.image;
	var description = req.body.description;
	var newCampground = {name: name, image: image, description: description};
	// create new campground and save to db
	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
			console.log(err);
		} else{
			console.log("campground added");
			res.redirect("/campgrounds");
		};
	});

	// redirect to campgrounds
});

//NEW
app.get("/campgrounds/new", function(req,res){
	res.render("new.ejs");
});

//SHOW
app.get("/campgrounds/:id", function(req,res){
	//find campground with id
	Campground.findById(req.params.id, function(err, foundCampground){
		if(err){
			console.log(err);
		} else{
			//render show template with that campground
			res.render("show", {campground: foundCampground});
		}
	});
	
	
	

});

app.listen(3000, function(){
	console.log("server has started")
});