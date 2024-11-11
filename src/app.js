import express from 'express';
import handlebars from 'express-handlebars';
import viewsRouter from './routers/views.router/js'
import { Server } from 'socket.io'

const app = express();
const PORT = 8080

app.use(express.json())
app.use(express.urlencoded({ extended: true  }))

app.engine('handlebars', handlebars.engine())

app.set('views', __dirname + '/views')
app.set('view', 'handlebars')

app.use('/hbs', viewsRouter)

const httpServer = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

const socketServer = new Server(httpServer)
