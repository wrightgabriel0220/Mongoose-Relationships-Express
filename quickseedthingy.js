const mongoose = require("mongoose");
const Farm = require('./models/farm');

mongoose.connect("mongodb://localhost:27017/farmStandTake2", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "conection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const seedFarms = async (farms) => {
    for (let farm of farms) {
        await farm.save();
        console.log(farm.name + ' saved successfully!');
    }
    console.log("All your seeds are in! :) Have a nice day!")
    mongoose.connection.close();
}

const farm1 = new Farm({
    name: "Funny Farms",
    city: "Phoenix",
    email: "gilbertgoober12@sillymail.com"
});

const farm2 = new Farm({
    name: "Sunshine Fields Farm",
    city: "Boulder",
    email: "testyboi69@testmail.com"
});

const farm3 = new Farm({
    name: "Absolute Unit Farms",
    city: "Chadville",
    email: "chadbradson42069@urmom.com"
});

const farms = [farm1, farm2, farm3];
seedFarms(farms);