const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");

const dbPath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertTodoDBObjectTOResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    category: dbObject.category,
    priority: dbObject.priority,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

const hasCategoryAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

const hasCategoryAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};

const hasSearchProperty = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};

//API 1
app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status, category } = request.query;
  let getTodosQuery = "";
  let data = "";

  switch (true) {
    //Scenario 1 -- has status only
    case hasStatusProperty(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        getTodosQuery = `
            SELECT 
              * 
            FROM 
              todo 
            WHERE 
              status = '${status}';`;
        data = await db.all(getTodosQuery);
        response.send(
          data.map((eachTodo) => convertTodoDBObjectTOResponseObject(eachTodo))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    //Scenario 2 -- has priority only
    case hasPriorityProperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        getTodosQuery = `
            SELECT 
              * 
            FROM 
              todo 
            WHERE 
              priority = '${priority}';`;
        data = await db.all(getTodosQuery);
        response.send(
          data.map((eachTodo) => convertTodoDBObjectTOResponseObject(eachTodo))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    //Scenario 3 -- has priority and status only
    case hasPriorityAndStatusProperties(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodosQuery = `
            SELECT 
              * 
            FROM 
              todo 
            WHERE 
              priority = '${priority}' AND status = '${status}';`;
          data = await db.all(getTodosQuery);
          response.send(
            data.map((eachTodo) =>
              convertTodoDBObjectTOResponseObject(eachTodo)
            )
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    //Scenario 4 -- has search only
    case hasSearchProperty(request.query):
      getTodosQuery = `
        SELECT 
            * 
        FROM 
            todo 
        WHERE 
            todo like '%${search_q}%';`;
      data = await db.all(getTodosQuery);
      response.send(
        data.map((eachTodo) => convertTodoDBObjectTOResponseObject(eachTodo))
      );
      break;

    //Scenario 5 -- has category and status only
    case hasCategoryAndStatusProperties(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodosQuery = `
            SELECT 
              * 
            FROM 
              todo 
            WHERE 
              category = '${category}' AND status = '${status}';`;
          data = await db.all(getTodosQuery);
          response.send(
            data.map((eachTodo) =>
              convertTodoDBObjectTOResponseObject(eachTodo)
            )
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    //Scenario 6 -- has category only
    case hasCategoryProperty(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        getTodosQuery = `
            SELECT 
              * 
            FROM 
              todo 
            WHERE 
              category = '${category}';`;
        data = await db.all(getTodosQuery);
        response.send(
          data.map((eachTodo) => convertTodoDBObjectTOResponseObject(eachTodo))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    //Scenario 7 -- has category and priority only
    case hasCategoryAndPriorityProperties(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          getTodosQuery = `
            SELECT 
              * 
            FROM 
              todo 
            WHERE 
              category = '${category}' AND priority = '${priority}';`;
          data = await db.all(getTodosQuery);
          response.send(
            data.map((eachTodo) =>
              convertTodoDBObjectTOResponseObject(eachTodo)
            )
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    default:
      getTodosQuery = `
            SELECT 
              * 
            FROM 
              todo 
            WHERE 
              todo LIKE '%${search_q}%';`;
      data = await db.all(getTodosQuery);
      response.send(
        data.map((eachTodo) => convertTodoDBObjectTOResponseObject(eachTodo))
      );
  }
});

//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT
      *
    FROM 
      todo
    WHERE
      id = ${todoId};`;
  const todo = await db.get(getTodoQuery);
  response.send(convertTodoDBObjectTOResponseObject(todo));
});

//API 3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  //   console.log(isMatch(date, "yyyy-MM-dd"));
  if (isMatch(date, "yyyy-MM-dd")) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    const getDateQuery = `
        SELECT
          *
        FROM
          todo
        WHERE
          due_date = '${newDate}';`;
    const agendaTodo = await db.all(getDateQuery);
    response.send(
      agendaTodo.map((eachTodo) =>
        convertTodoDBObjectTOResponseObject(eachTodo)
      )
    );
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API 4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const postNewDueDate = format(new Date(dueDate), "yyyy-MM-dd");
          const addTodoQuery = `
            INSERT INTO 
                todo (id, todo, priority, status, category, due_date)
            VALUES
                (${id}, '${todo}', '${priority}', '${status}', '${category}', '${postNewDueDate}');`;
          await db.run(addTodoQuery);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});

//API 5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;
  let updatedColumn = "";
  let updateTodoQuery = "";

  const previousTodoQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const previousTodo = await db.get(previousTodoQuery);

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.dueDate,
  } = request.body;

  switch (true) {
    //Scenario 1 -- update status
    case requestBody.status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        updateTodoQuery = `
            UPDATE
              todo
            SET
              todo = '${todo}',
              priority = '${priority}',
              status = '${status}',
              category = '${category}',
              due_date = '${dueDate}'
            WHERE
              id = '${todoId}';`;
        await db.run(updateTodoQuery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    //Scenario 2 -- update priority
    case requestBody.priority !== undefined:
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        updateTodoQuery = `
            UPDATE
              todo
            SET
              todo = '${todo}',
              priority = '${priority}',
              status = '${status}',
              category = '${category}',
              due_date = '${dueDate}'
            WHERE
              id = '${todoId}';`;
        await db.run(updateTodoQuery);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    //Scenario 3 -- update todo
    case requestBody.todo !== undefined:
      updateTodoQuery = `
        UPDATE
            todo
        SET
            todo = '${todo}',
            priority = '${priority}',
            status = '${status}',
            category = '${category}',
            due_date = '${dueDate}'
        WHERE
            id = '${todoId}';`;
      await db.run(updateTodoQuery);
      response.send("Todo Updated");
      break;

    //Scenario 4 -- update category
    case requestBody.category !== undefined:
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        updateTodoQuery = `
            UPDATE
              todo
            SET
              todo = '${todo}',
              priority = '${priority}',
              status = '${status}',
              category = '${category}',
              due_date = '${dueDate}'
            WHERE
              id = '${todoId}';`;
        await db.run(updateTodoQuery);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    //Scenario 5 -- update dueDate
    case requestBody.dueDate !== undefined:
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const newDueDate = format(new Date(dueDate), "yyyy-MM-dd");
        updateTodoQuery = `
            UPDATE
              todo
            SET
              todo = '${todo}',
              priority = '${priority}',
              status = '${status}',
              category = '${category}',
              due_date = '${newDueDate}'
            WHERE
              id = '${todoId}';`;
        await db.run(updateTodoQuery);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }
});

//API 6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM
      todo
    WHERE
      id = ${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
