var express = require("express"),
	app = express(),
	bodyParser = require("body-parser"),
	mongoose = require("mongoose"),
	passport = require("passport"),
	LocalStrategy = require("passport-local"),
	Campground = require("./models/campground.js"),
	Comment = require("./models/comment"),
	User = require("./models/user"),
	seedDB = require("./seeds");


mongoose.connect("mongodb://localhost:27017/yelp_camp", {useNewUrlParser: true, useUnifiedTopology: true});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
seedDB();

//Passport Configuration
app.use(require("express-session")({
	secret: "Lotje",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

app.get("/", function(req,res){
	res.render("landing");
});

//INDEX
app.get("/campgrounds", function(req,res){
	Campground.find({}, function(err, allcampgrounds){
		if(err){
			console.log(err);
		} else{
			res.render("campgrounds/index",{campgrounds:allcampgrounds, currentUser: req.user})
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

app.get("/campgrounds/:id/comments/new", isLoggedIn, function(req, res){
	//find campground by id
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err);
		} else{
			res.render("comments/new", {campground: campground})
		}
	});

});

app.post("/campgrounds/:id/comments", isLoggedIn, function(req, res){
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

// ==============
// AUTH ROUTES
// ==============

// show register form
app.get("/register", function(req, res){
	res.render("register");
});
// handle signup logic
app.post("/register", function(req, res){
	let newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log(err);
			return res.render("register");
		}
		passport.authenticate("local")(req, res, function(){
			res.redirect("/campgrounds");
		})
	})
});

// show login form
app.get("/login", function(req, res){
	res.render("login");
});

//handling login logic
app.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/campgrounds",
		failureRedirect: "/login"
	}), function(req, res){	
});

// logout route
app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/campgrounds");
})

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

app.listen(3000, function(){
	console.log("server has started")
});