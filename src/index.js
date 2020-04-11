const express = require('express');
const cors = require('cors');
const {uuid, isUuid} = require('uuidv4');

const app = express();

app.use(cors()); //serve para segurança, pode-se configurar os endereços dos frontends que terão acesso ao CORS

app.use(express.json());

const projects = [];

function logRequests(request, response, next) {
  const {method, url } = request

  const logLabel = `[${method.toUpperCase()}] ${url}`;

  console.time(logLabel);

  next(); //se não for chamada a função, o próximo middleare não sera disparado, neste caso, a rota chamada.

  console.timeEnd(logLabel);
}

function validadeProjectId(request, response, next){
  const { id } = request.params;

  if(!isUuid(id)){
    return response.status(400).json({error :"Invalid project ID."})
  }

  return next();

}

app.use(logRequests); //se for colocado aqui, este middleare irá ser acionado sempre que qualquer requisição for chamada
app.use('/projects/:id', validadeProjectId);


app.get('/projects', /*logRequests,*/ (request, response) => { //middlewares podem ser chamados dentro da função de requisição também
 
  const {title} = request.query;

  const results = title 
    ? projects.filter(project => project.title.includes(title))
    : projects;
  //Se title for verdadeiro (tiver valor) results recebe o filtro de projects, senão recebe tudo.

  return response.json(results);
});

app.post('/projects',(request, response) => {
  const {title, owner} = request.body;

  const project = { id:uuid(), title, owner};

  projects.push(project);

  return response.json(project);
});

app.put('/projects/:id', (request, response) => {
  const {id} = request.params;
  const {title, owner} = request.body;

  const projectIndex = projects.findIndex( project => project.id === id);

  if(projectIndex < 0) {
    return response.status(400).json({error: 'Project Not Found'});
  }

  const project = {
    id,
    title,
    owner,
  };

  projects[projectIndex] = project;

  return response.json({project});
  });

  app.delete('/projects/:id',(request, response) => {
    const { id } = request.params; 

    const projectIndex = projects.findIndex( project => project.id === id);

    if(projectIndex < 0) {
      return response.status(400).json({error: 'Project Not Found'});
    }

    projects.splice(projectIndex, 1);

    return response.status(204).send();
    });

app.listen(3333, () => {
  console.log('🚀 Back-end started!')
});