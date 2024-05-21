const express = require('express')
const app = express()
app.use(express.json())
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const dbPath = path.join(__dirname, 'todoApplication.db')

let db = null
const connectDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server has Started at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
connectDBAndServer()

app.get('/todos/', async (request, response) => {
  const {search_q = '', status, priority} = request.query
  let data = null
  let sqlQuery = ''
  const hasStatusAndPriority = requestQuery => {
    return (
      requestQuery.priority != undefined && requestQuery.status != undefined
    )
  }
  const hasStatus = requestQuery => {
    return requestQuery.status != undefined
  }
  const hasPriority = requestQuery => {
    return requestQuery.priority != undefined
  }
  switch (true) {
    case hasStatusAndPriority(request.query):
      sqlQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'
                                        AND  status = '${status}'
                                        AND priority = '${priority}';`
      break

    case hasStatus(request.query):
      sqlQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'
                                        AND  status = '${status}'
                                        ;`
      break

    case hasPriority(request.query):
      sqlQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'
                                        AND priority = '${priority}';`
      break
    default:
      sqlQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`
  }
  data = await db.all(sqlQuery)
  response.send(data)
})

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodoIdQuery = `SELECT * FROM todo WHERE id = ${todoId};`
  const dbObject = await db.get(getTodoIdQuery)
  response.send(dbObject)
})

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const addTodoItem = `INSERT INTO todo (id, todo, priority, status)
                        VALUES (
                          '${id}',
                          '${todo}',
                          '${priority}',
                          '${status}'
                        );`
  await db.run(addTodoItem)
  response.send('Todo Successfully Added')
})

app.put('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params
  let query = ''
  const {status, priority, todo} = request.query
  const updateStatus = requestQuery => {
    return requestQuery.status !== undefined
  }
  const updatePriority = requestQuery => {
    return requestQuery.priority !== undefined
  }
  const updateTodo = requestQuery => {
    return requestQuery.todo !== undefined
  }

  switch (true) {
    case updateStatus(request.query):
      query = `UPDATE todo 
               SET status = '${status}'
               WHERE id = ${todoId};`
      await db.run(query)
      response.send('Status Updated')
      break

    case updatePriority(request.query):
      query = `UPDATE todo 
               SET priority = '${priority}'
               WHERE id = ${todoId};`
      await db.run(query)
      response.send('Priority Updated')
      break

    case updateTodo(request.query):
      query = `UPDATE todo 
               SET todo = '${todo}'
               WHERE id = ${todoId};`
      await db.run(query)
      response.send('Todo Updated')
      break
    default:
      query = ''
      response.send('No details to update')
  }
})

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const query = `DELETE FROM todo WHERE id = ${todoId};`
  await db.run(query)
  response.send('Todo Deleted')
})

module.exports = app
