const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config()

const port = (process.env.PORT||7000);

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());
app.get('/', (req, res) => {
	res.send('Hello World!')
})

const MongoClient = require('mongodb').MongoClient;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qthye.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
	const appointmentCollection = client.db("doctorsPortal").collection("appointment");
	const doctorCollection = client.db("doctorsPortal").collection("doctors");
	app.get('/appointment', (req, res) => {
		appointmentCollection.find({})
			.toArray((err, documents) => {
			res.send(documents)
		})
 })

	app.post('/addAppointment', (req, res) => {
		const Appointment = req.body;
		appointmentCollection.insertOne(Appointment)
			.then(result => {
				res.send(result.insertedCount > 0);
			})
		console.log('newEvent', newEvent);
	})

	app.post('/appoinmentByDate', (req, res) => {
		const date = req.body;
		console.log(date.date);
		appointmentCollection.find({date: date.date})
			.toArray((err, documents) => {
				res.send(documents)
				console.log(documents);
			})
	})

	
	app.post('/addADoctor', (req, res) => {
		const file = req.files.file;
		const name = req.body.name;
		const email = req.body.email;
		const newImg = file.data;
		const encImg = newImg.toString('base64');

		var image = {
			contentType: file.mimetype,
			size: file.size,
			img: Buffer.from(encImg, 'base64')
		};

		doctorCollection.insertOne({ name, email, image })
			.then(result => {
				res.send(result.insertedCount > 0);
			})
	})

	app.get('/doctors', (req, res) => {
		doctorCollection.find({})
			.toArray((err, documents) => {
				res.send(documents);
			})
	});


	console.log("database Connected");
	// client.close();
});
app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})