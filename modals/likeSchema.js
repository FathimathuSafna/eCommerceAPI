import mongoose from "mongoose";

var Schema = mongoose.Schema;
var likeSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food",    
        required: true,
    },
    likedAt: {
        type: Date,
        default: Date.now,
    },
    
});

const Likes = mongoose.model("Likes",likeSchema );
export default Likes;
