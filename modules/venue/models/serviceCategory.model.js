const mongoose = require("mongoose");

const serviceCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    }
},
{
    timestamps: true,
}
);

// Create Model
const ServiceCategory = mongoose.model("ServiceCategory", serviceCategorySchema);

module.exports = ServiceCategory;
