import mongoose from "mongoose";

export type Schema = {
    UserId: {
        type: number,
        required: [true, "The player's UserId is required!"],
    },
    Items: {
        type: {
            [key: string]: {
                ItemName: string,
                ItemValue: number,
            },
        },
        required: false,
    },
    ModerationHistory: {
        type: {
            [key: string]: {
                IdentifyingNumber: number,
                Context: string,
            },
        },
        required: false,
    },
};

const DataSchema: mongoose.Schema<Schema> = new mongoose.Schema({
    UserId: {
        type: Number,
        required: [true, "The player's UserId is required!"],
    },
    Items: {
        type: Map,
        of: {
            ItemName: String,
            ItemValue: Number,
        },
        required: false
    },
    ModerationHistory: {
        type: Map,
        of: {
            IdentifyingNumber: Number,
            Context: String,
        },
        required: false,
    },
}, {
    timestamps: true,
});

const Product: mongoose.Model<Schema> = mongoose.model("Product", DataSchema);

export default Product;