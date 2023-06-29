const express = require('express')
const ejs = require("ejs")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")

const app = express()
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static("public"))
app.set('view engine', 'ejs')

mongoose.set('strictQuery', false);
mongoose.connect('mongodb+srv://mesaaransh:MduRGt8gPWFIJUpf@cluster0.x2j4nhi.mongodb.net/timetable')


const teacherSchema = new mongoose.Schema({
    name: String,
    code: String,
    designation: String,
    _id: Number,
    mobile: String,
    email: String, 
})

const subjectSchema = new mongoose.Schema({
    name: String,
    _id: String,
    lectures: Number,
    tutorials: Number,
    practicals: Number,

})

const slotSchema = new mongoose.Schema({

    _id: Number,
    startTime: String,
    endTime: String,

})

const occupancySchema = new mongoose.Schema({
    day: Number,
    endTime: {
        type: Number,
        ref: 'slot'
    },
    startTime: {
        type: Number,
        ref: 'slot'
    },
    teacher: {
        type: Number,
        ref: 'teacher'
    },
    subject: {
        type: String,
        ref: 'subject'
    },
    type: String,
    room: String,
})

const teacherTable = mongoose.model('teacher', teacherSchema);
const subjectTable = mongoose.model('subject', subjectSchema);
const slotTable = mongoose.model('slot', slotSchema);
const occupancyTable = mongoose.model('occupancy', occupancySchema);

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

var payload = {
    name: "",
    designation: "",
    code: "",
    subject: "",
    scode: "",
    room: "",
    status: "",
    display: "hidden",
}

var error = {
    display : "hidden",
    message: ""
}

app.get("/", async function(req, res){
    const teachers = await teacherTable.find({});
    res.render("pages/index", {teachers, payload, error});
})

app.post("/teacher", async function(req, res){

    
    const lecture = await occupancyTable.find({teacher: req.body.teacher, $or: [{startTime: req.body.time}, {endTime: req.body.time}], day: req.body.day})
    const teacher = await teacherTable.findById(req.body.teacher)
    if (teacher == null) {
        error = {
            display: "",
            message: "Teacher not Found",
        }
        payload.display = "hidden";
    }
    else if (lecture.length == 0) {
        const slot = await slotTable.findById(req.body.time)
        payload = {
            name: teacher.name,
            designation: teacher.designation,
            code: teacher.code,
            startTime: slot.startTime,
            endTime: slot.endTime,
            day: days[req.body.day],
            status: "Vaccant",
            statusClass: "success",
            display: ""
        }
        error = {
            display: "hidden"
        }
    }
    else{

        const subject = await subjectTable.findById(lecture[0].subject)
        const startTime = await slotTable.findById(lecture[0].startTime)
        const endTime = await slotTable.findById(lecture[0].endTime)

        payload = {
            name: teacher.name,
            designation: teacher.designation,
            code: teacher.code,
            subject: subject.name,
            scode: subject.id,
            room: lecture[0].room,
            startTime: startTime.startTime,
            endTime: endTime.endTime,
            day: days[req.body.day],
            status: "Occupied",
            statusClass: "warning",
            display: ""
        }
        error = {
            display: "hidden"
        }
    }

    console.log(payload);

    res.redirect("/")    
})

const PORT = process.env.PORT || 8080

app.listen(PORT, ()=>{console.log("----------AppStarted-----------");})