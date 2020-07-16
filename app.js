var express = require("express"),
	app = express(),
	bodyParser = require("body-parser"),
	mongoose = require("mongoose"),
	Campground = require("./models/campground.js"),
	Comment = require("./models/comment"),
	seedDB = require("./seeds");

seedDB();
mongoose.connect("mongodb://localhost:27017/yelp_camp", {useNewUrlParser: true, useUnifiedTopology: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

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
			res.render("campgrounds/index",{campgrounds:allcampgrounds})
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
	res.render("campgrounds/new.ejs");
});

//SHOW
app.get("/campgrounds/:id", function(req,res){
	//find campground with id
	Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
		if(err){
			console.log(err);
		} else{
			//render show template with that campground
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});	
});

//comments routes

app.get("/campgrounds/:id/comments/new", function(req, res){
	//find campground by id
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
		} else{
			res.render("comments/new", {campground: campground})
		}
	});

});

app.post("/campgrounds/:id/comments", function(req, res){
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
			res.redirect("/campgrounds");
		} else{
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					console.log(err);
				} else {
					campground.comments.push(comment);
					campground.save();
					res.redirect("/campgrounds/"+ campground._id)
				}
			})
		}
	});
});

app.listen(3000, function(){
	console.log("server has started")
});