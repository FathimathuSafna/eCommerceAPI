import mongoose from "mongoose";

var Schema = mongoose.Schema;
var adminSchema = new Schema({
  userName: {
    type: String,
    required: true,
  },
  passWord:{
    type: String,
    required:true,
  }
});

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
