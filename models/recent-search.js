var mongoose=require('mongoose');
var schema = mongoose.Schema({
   term: String,
   when: String
});
var modelClass = mongoose.model("RecentSearch", schema);
module.exports=modelClass;