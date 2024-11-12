const express = require("express");
const app = express()
const dotenv = require("dotenv");
const UserRoute = require("./route/userRoute");
 const cors = require("cors");
const connection = require("./config/database");
 const ProjectRoute = require("./route/projectRoute");
  const EventRoute = require("./route/eventRoute");
 const TaskRoute = require("./route/taskRoute");
const InvoiceRoute = require("./route/invoiceRoute");
const HolidayRoute = require("./route/holidayRoute");
const DepartmentRouter = require("./route/departmentRoute");
const PaymentRouter = require("./route/paymentRoute");
const ProductRoute = require("./route/productRoute");
const RBACRouter = require("./route/RBACRoute");
const attendanceRouter = require("./route/attendanceRoute");
const SalaryRouter = require("./route/salaryRoute");
const PolicyRouter = require("./route/policyRoute");
const ResignationRouter = require("./route/performationsRoute");
 const dashboardRoute = require("./route/dashboardRoute");
dotenv.config()
PORT = process.env.PORT || 2000

 
app.use(express.json());
app.use(cors())


app.use("/" , RBACRouter)

app.use("/user" , UserRoute)
app.use("/project", ProjectRoute)
app.use("/event",EventRoute)
app.use('/task',TaskRoute)
app.use("/",InvoiceRoute)
app.use("/",HolidayRoute)
app.use('/',DepartmentRouter)
app.use("/",PaymentRouter)
app.use("/product",ProductRoute)
app.use("/",attendanceRouter)
app.use("/salary",SalaryRouter)
app.use("/policy",PolicyRouter)
app.use("/",ResignationRouter)
 
app.use("/",dashboardRoute)


app.use("/test",async (req,res)=>{
    return res.status(200).send("Welcome Shivour👍")
})

 
app.listen(PORT , async (req,res)=>{
    try {
        await connection
        console.log("MongoDB is connected.")
    } catch (error) {
        console.log(error)
    }
    console.log(`Server is running on PORT : ${PORT}`)
})


