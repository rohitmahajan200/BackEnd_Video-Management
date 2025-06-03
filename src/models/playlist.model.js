import mongoose,{Schema, Types} from "mongoose";
//import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const playListSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    videos:
    [
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ]
},
{
    timestamps:true
})

//mongoose.plugin(mongooseAggregatePaginate);

export const Playlist=mongoose.model("Playlist",playListSchema)