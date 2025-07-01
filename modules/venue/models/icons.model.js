const mongoose = require("mongoose");

const iconSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    icon: {
        type: String,
        required: true,
    }
},
{
    timestamps: true,
}

);

// Create Model
const Icon = mongoose.model("Icon", iconSchema);

module.exports = Icon;
