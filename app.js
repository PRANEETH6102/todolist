//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require('mongoose')
const _=require("lodash")
mongoose.connect('mongodb+srv://admin-praneeth:Praneeth-6102@cluster0.fgvgmhf.mongodb.net/todolistDB', {useNewUrlParser: true});

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "walk"
});

const item2 = new Item({
  name: "run"
});

const item3 = new Item({
  name: "read"
});



const defaultItems = [item1, item2, item3];

const listSchema={
  name:String,
  items:[itemsSchema]
}

const List=mongoose.model("List",listSchema)

app.get("/", function(req, res) {

  Item.find({}).then(foundItems=>{
    if(foundItems.length===0){
      Item.insertMany(defaultItems)
      res.redirect("/")
    }

    else{
      res.render("list", {listTitle: "Today", newListItems:foundItems});
    }
  })
});

app.get("/:customListName",(req,res)=>{
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({ name: customListName })
    .then(function (foundList) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    })
    .catch(function (err) {
      console.log(err);
    });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list
  const item=new Item({
    name:itemName
  })

  if(listName==="Today"){
    item.save();
    res.redirect("/")
  }
  else{
    List.findOne({name:listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName)
    })
  }
  


});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox
  const listName=req.body.listName

  if(listName==="Today"){
    Item.findByIdAndDelete(checkedItemId).then(function(err){
      res.redirect("/")
    })
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then(function(foundList){
      res.redirect("/"+listName)
    })
  }

  

})



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
