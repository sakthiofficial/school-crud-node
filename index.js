import express from "express";
import { MongoClient } from "mongodb";
import * as dotenv from 'dotenv'
dotenv.config()


let school = express();
let port = process.env.PORT;
let MONGO_URL = process.env.MONGO_URL

let client = new MongoClient(MONGO_URL);
await client.connect();
console.log("Db connected 🎉🎉");
// converter to json.

school.use(express.json())
school.get("/", (req, res) => {
    res.send(" Welcome ✨😍💥")
})
school.listen(port, () => console.log("Connected 😮‍💨👍"))

// create mentor.
school.post("/school/mentor", async (req, res) => {

    let data = req.body;
    let result = await client.db("school").collection("mentor").insertOne({ ...data, "student": [] })
    result.acknowledged ? res.send("Successfully added the mentor") : res.send("Something Error")
})


// creating student
school.post("/school/student", async (req, res) => {

    let data = req.body;
    let result = await client.db("school").collection("students").insertOne({ ...data, "mentor": null })
    result.acknowledged ? res.send("Successfully added the student") : res.send("Something Error")
})
// adding students
school.put("/school/addstudent/:id", async (req, res) => {
    let { id } = req.params;

    let data = req.body
    let students = await client.db("school").collection("mentor").findOne({ "id": +id })
    data.student.map(async (val) => {
        let studentData = await client.db("school").collection("students").findOne({ "id": val });
        if (studentData.mentor != val) {
            let result = await client.db("school").collection("mentor").updateOne({ "id": +id }, {
                $set: { "student": [...students.student, val] }
            });
            let studentData = await client.db("school").collection("students").updateOne({ "id": val }, { $set: { "mentor": +id } })
            res.send(result)
        } else {
            res.send("This is id" + " " + 1 + " is already being student for this mentor")
        }


    })



})

// adding mentor
school.put("/school/addmentor/:id", async (req, res) => {
    let { id } = req.params;
    let data = req.body
    let mentor = await client.db("school").collection("students").findOne({ "id": +id })
    if (!mentor.mentor) {
        // res.send("hii")
        let students = await client.db("school").collection("mentor").findOne({ "id": data.mentor })
        let studentData = await client.db("school").collection("students").updateOne({ "id": +id }, { $set: data })
        await client.db("school").collection("mentor").updateOne({ "id": data.mentor }, {
            $set: { "student": [...students.student, +id] }
        });
        res.send(studentData);
    } else {
        res.send("bye")
    }
    // console.log(studentData);
    res.send(mentor.mentor);
    console.log(data.mentor);
})

// mentor students.
school.get("/school/mentor/:id", async (req, res) => {
    let { id } = req.params;
    let students = await client.db("school").collection("mentor").findOne({ "id": +id });
    // console.log(students.student.length);
    if (students.student.length == 0) {
        res.send("No students are there for the mentor")
    } else {
        students.student.map(async val => {
            let data = await client.db("school").collection("students").findOne({ "id": val });
            res.send(data)
            console.log(val);
            // console.log(val);

        })
    }
})
