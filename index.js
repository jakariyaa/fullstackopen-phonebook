require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

app.use(express.static('dist'))
app.use(express.json())

morgan.token('req-body', (request) => {
  return request.body ? JSON.stringify(request.body) : ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'))

app.get('/api/persons', (request, response) => {
  Person.find({}).then(person => {
    response.json(person)
  })
})

app.get('/info', (request, response) => {
  const now = new Date().toString()
  Person.countDocuments({}).then(result => {
    response.send(
      `<div>Phonebook has info for ${result} people</div>` +
      `</br>` +
      `<div>${now}</div>`
    )
  })
})

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  Person.findById(id).then(person => {
    person ? response.json(person) : response.status(404).end()
  }).catch(error => {
    response.status(400).json({
      error: 'Invalid ID',
      message: error.message
    })
  })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  Person.findByIdAndDelete(id).then(deleted => {
    response.status(204).json(deleted)
  })
})

app.post('/api/persons', (request, response) => {
  const body = request.body
  if (!body || !body.name || !body.number) {
    return response.status(400).json({
      error: 'Bad Request. Missing Information.'
    })
  }

  Person.findOne({ name: body.name }).then(found => {
    if (found) {
      return response.status(409).json({
        error: 'Name must be unique.'
      })
    } else {

      const person = new Person({
        name: body.name,
        number: body.number
      })

      person.save().then(savedPerson => {
        response.status(201).json(savedPerson)
      })
    }
  })
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log("Server running at:", PORT)
})