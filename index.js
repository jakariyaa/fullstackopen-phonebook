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

app.use(morgan(':method :url :status :res[content-length] - ' +
  ':response-time ms :req-body'))

app.get('/info', (request, response, next) => {
  const now = new Date().toString()
  Person.countDocuments({}).then(result => {
    response.send(
      `<div>Phonebook has info for ${result} people</div>` +
      `</br>` +
      `<div>${now}</div>`
    )
  }).catch(error => {
    console.log(error);
    next(error)
  })
})

app.get('/api/persons', (request, response, next) => {
  Person.find({}).then(person => {
    response.json(person)
  }).catch(error => {
    console.log(error);
    next(error)
  })
})

app.post('/api/persons', (request, response, next) => {
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
      }).catch(error => {
        console.log(error);
        next(error)
      })
    }
  }).catch(error => {
    console.log(error);
    next(error)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findById(id).then(person => {
    person ? response.json(person) : response.status(404).end()
  }).catch(error => {
    console.log(error);
    next(error)
  })
})

app.put('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findById(id).then(person => {
    if (!person) {
      return response.status(404).end()
    }
    person.number = request.body.number
    person.save().then(updatedPerson => {
      response.json(updatedPerson)
    }).catch(error => {
      console.log(error);
      next(error)
    })
  }).catch(error => {
    console.log(error);
    next(error)
  })
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findByIdAndDelete(id).then(result => {
    response.status(204).end()
  }).catch(error => {
    console.log(error);
    next(error)
  })
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).json({
      error: 'Invalid ID Format'
    })
  }

  next(error)
}
app.use(errorHandler)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log("Server running at:", PORT)
})