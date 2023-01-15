const mongoose = require("mongoose");
const Joi = require("joi");

const foodSchema = new mongoose.Schema({
    name: String,
    description: String,
    img_url: { type: String, default: "" },
    calories: Number,
    ingredient: String,
    recipe: String,
    dishes: Number,
    prepHours: {
        type: Number, default: 0
    },
    prepMinutes: Number,
    likes: [String],
    categories_url: String,
    user_id: String,
    user_nickname: String,
    active: {
        type: Boolean, default: true
    },
    date_created: {
        type: Date, default: Date.now()
    },
    updatedAt: {
        type: Date, default: Date.now()
    },
    totalPrepMinutes: {
        type: Number, default: 0
    },
})

exports.FoodModel = mongoose.model("foods", foodSchema);

exports.validateFood = (_reqBody) => {
    let joiSchema = Joi.object({
        name: Joi.string().min(2).max(99).required(),
        description: Joi.string().min(3).max(500).allow(null, ""),
        img_url: Joi.string().min(2).max(200).allow(null, ""),
        calories: Joi.number().min(2).max(2000).allow(null, ""),
        ingredient: Joi.string().min(2).max(99).allow(null, ""),
        recipe: Joi.string().min(2).max(1000).allow(null, ""),
        dishes: Joi.number().min(1).max(30).required(),
        prepHours: Joi.number().min(1).max(12).allow(null, ""),
        prepMinutes: Joi.number().min(1).max(60).allow(null, ""),
        categories_url: Joi.string().min(2).max(99).required(),
        user_nickname: Joi.string().min(2).max(99).allow(null, ""),
    })
    return joiSchema.validate(_reqBody);
}
