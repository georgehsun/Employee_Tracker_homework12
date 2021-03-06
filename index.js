const mysql = require("mysql");
const inquirer = require("inquirer");
require("console.table");
// const sql = require("./sql");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "august16",
    database: "employeesDB"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    firstPrompt();
});

// function which prompts the user for what action they should take
function firstPrompt() {

    inquirer
        .prompt({
            type: "list",
            name: "task",
            message: "Would you like to do?",
            choices: [
                "View Employees",
                "View Employees by Department",
                // "View Employees by Manager",
                "Add Employee",
                "Remove Employees",
                "Update Employee Role",
                "Add Role",
                // "Remove Role",
                // "Update Employee Manager",
                "End"
            ]
        })
        .then(function({ task }) {
            switch (task) {
                case "View Employees":
                    viewEmployee();
                    break;
                case "View Employees by Department":
                    viewEmployeeByDepartment();
                    break;
                    // case "View Employees by Manager":
                    //   viewEmployeeByManager();
                    //   break;
                case "Add Employee":
                    addEmployee();
                    break;
                case "Remove Employees":
                    removeEmployees();
                    break;
                case "Update Employee Role":
                    updateEmployeeRole();
                    break;
                case "Add Role":
                    addRole();
                    break;
                    // case "Remove Role":
                    //   removeRole();
                    //   break;

                    // case "Update Employee MAnager":
                    //   updateEmployeeManager();
                    //   break;

                case "End":
                    connection.end();
                    break;
            }
        });
}

//////////////////========================= 1."View Employees"/ READ all, SELECT * FROM

function viewEmployee() {
    console.log("Viewing employees\n");

    var query =
        `SELECT e.id, e.firstname, e.lastname, r.title, d.name AS department, r.salary, CONCAT(m.firstname, ' ', m.lastname) AS manager
  FROM employeesDB e
  LEFT JOIN role r
	ON e.role_id = r.id
  LEFT JOIN department d
  ON d.id = r.department_id
  LEFT JOIN employeesDB m
	ON m.id = e.manager_id`

    connection.query(query, function(err, res) {
        if (err) throw err;

        console.table(res);
        console.log("Employees viewed!\n");

        firstPrompt();
    });
    // console.log(query.sql);
}



function viewEmployeeByDepartment() {
    console.log("Viewing employees by department\n");

    var query =
        `SELECT d.id, d.name, r.salary AS budget
     FROM employeesDB e
      LEFT JOIN role r
        ON e.role_id = r.id
      LEFT JOIN department d
      ON d.id = r.department_id
      ORDER BY d.id, d.name`

    connection.query(query, function(err, res) {
        if (err) throw err;


        const departmentChoices = res.map(data => ({
            value: data.id,
            name: data.name
        }));

        console.table(res);
        console.log("Department view succeed!\n");

        promptDepartment(departmentChoices);
    });
    // console.log(query.sql);
}

// User choose the department list, then employees pop up

function promptDepartment(departmentChoices) {

    inquirer
        .prompt([{
            type: "list",
            name: "departmentId",
            message: "Which department would you choose?",
            choices: departmentChoices
        }])
        .then(function(answer) {
            console.log("answer ", answer.departmentId);

            var query =


                connection.query(query, answer.departmentId, function(err, res) {
                    if (err) throw err;

                    console.table("response ", res);
                    console.log(res.affectedRows + "Employees are viewed!\n");

                    firstPrompt();
                });
        });
}


function addEmployee() {
    console.log("Inserting an employee!")

    var query =
        `SELECT r.id, r.title, r.salary 
      FROM role r`

    connection.query(query, function(err, res) {
        if (err) throw err;

        const roleChoices = res.map(({ id, title, salary }) => ({
            value: id,
            title: `${title}`,
            salary: `${salary}`
        }));

        console.table(res);
        console.log("RoleToInsert!");

        promptInsert(roleChoices);
    });
}

function promptInsert(roleChoices) {

    inquirer
        .prompt([{
                type: "input",
                name: "firstname",
                message: "What is the employee's first name?"
            },
            {
                type: "input",
                name: "lastname",
                message: "What is the employee's last name?"
            },
            {
                type: "list",
                name: "roleId",
                message: "What is the employee's role?",
                choices: roleChoices
            },

        ])
        .then(function(answer) {
            console.log(answer);

            var query = `INSERT INTO employee SET ?`
                // when finished prompting, insert a new item into the db with that info
            connection.query(query, {
                    firstname: answer.firstname,
                    lastname: answer.lastname,
                    role_id: answer.roleId,
                    manager_id: answer.managerId,
                },
                function(err, res) {
                    if (err) throw err;

                    console.table(res);
                    console.log(res.insertedRows + "Inserted successfully!\n");

                    firstPrompt();
                });
            // console.log(query.sql);
        });
}


function removeEmployees() {
    console.log("Deleting an employee");

    var query =
        `SELECT e.id, e.firstname, e.lastname
      FROM employee e`

    connection.query(query, function(err, res) {
        if (err) throw err;

        const deleteEmployeeChoices = res.map(({ id, firstname, lastname }) => ({
            value: id,
            name: `${id} ${firstname} ${lastname}`
        }));

        console.table(res);
        console.log("ArrayToDelete!\n");

        promptDelete(deleteEmployeeChoices);
    });
}

// User choose the employee list, then employee is deleted

function promptDelete(deleteEmployeeChoices) {

    inquirer
        .prompt([{
            type: "list",
            name: "employeeId",
            message: "Which employee do you want to remove?",
            choices: deleteEmployeeChoices
        }])
        .then(function(answer) {

            var query = `DELETE FROM employee WHERE ?`;
            // when finished prompting, insert a new item into the db with that info
            connection.query(query, { id: answer.employeeId }, function(err, res) {
                if (err) throw err;

                console.table(res);
                console.log(res.affectedRows + "Deleted!\n");

                firstPrompt();
            });
            // console.log(query.sql);
        });
}

//========================================= 6."Update Employee Role" / UPDATE,

function updateEmployeeRole() {
    employeeArray();

}

function employeeArray() {
    console.log("Updating an employee");

    var query =
        `SELECT e.id, e.firstname, e.lastname, r.title, d.name AS department, r.salary, CONCAT(m.firstname, ' ', m.lastname) AS manager
  FROM employeesDB e
  JOIN role r
	ON e.role_id = r.id
  JOIN department d
  ON d.id = r.department_id
  JOIN employeesDB m
	ON m.id = e.manager_id`

    connection.query(query, function(err, res) {
        if (err) throw err;

        const employeeChoices = res.map(({ id, firstname, lastname }) => ({
            value: id,
            name: `${firstname} ${lastname}`
        }));

        console.table(res);
        console.log("employeeArray To Update!\n")

        roleArray(employeeChoices);
    });
}

function roleArray(employeeChoices) {
    console.log("Updating an role");

    var query =
        `SELECT r.id, r.title, r.salary 
  FROM role r`
    let roleChoices;

    connection.query(query, function(err, res) {
        if (err) throw err;

        roleChoices = res.map(({ id, title, salary }) => ({
            value: id,
            title: `${title}`,
            salary: `${salary}`
        }));

        console.table(res);
        console.log("roleArray to Update!\n")

        promptEmployeeRole(employeeChoices, roleChoices);
    });
}

function promptEmployeeRole(employeeChoices, roleChoices) {

    inquirer
        .prompt([{
                type: "list",
                name: "employeeId",
                message: "Which employee do you want to set with the role?",
                choices: employeeChoices
            },
            {
                type: "list",
                name: "roleId",
                message: "Which role do you want to update?",
                choices: roleChoices
            },
        ])
        .then(function(answer) {

            var query = `UPDATE employee SET role_id = ? WHERE id = ?`
                // when finished prompting, insert a new item into the db with that info
            connection.query(query, [answer.roleId,
                    answer.employeeId
                ],
                function(err, res) {
                    if (err) throw err;

                    console.table(res);
                    console.log(res.affectedRows + "Updated successfully!");

                    firstPrompt();
                });
            // console.log(query.sql);
        });
}



//////////////////========================= 7."Add Role" / CREATE: INSERT INTO

function addRole() {

    var query =
        `SELECT d.id, d.name, r.salary AS budget
    FROM employeesDB e
    JOIN role r
    ON e.role_id = r.id
    JOIN department d
    ON d.id = r.department_id
    ORDER BY d.id, d.name`

    connection.query(query, function(err, res) {
        if (err) throw err;

        // (callbackfn: (value: T, index: number, array: readonly T[]) => U, thisArg?: any)
        const departmentChoices = res.map(({ id, name }) => ({
            value: id,
            name: `${id} ${name}`
        }));

        console.table(res);
        console.log("Department array!");

        promptAddRole(departmentChoices);
    });
}

function promptAddRole(departmentChoices) {

    inquirer
        .prompt([{
                type: "input",
                name: "roleTitle",
                message: "Role title?"
            },
            {
                type: "input",
                name: "roleSalary",
                message: "Role Salary"
            },
            {
                type: "list",
                name: "departmentId",
                message: "Department?",
                choices: departmentChoices
            },
        ])
        .then(function(answer) {

            var query = `INSERT INTO role SET ?`

            connection.query(query, {
                    title: answer.title,
                    salary: answer.salary,
                    department_id: answer.departmentId
                },
                function(err, res) {
                    if (err) throw err;

                    console.table(res);
                    console.log("Role Inserted!");

                    firstPrompt();
                });

        });
}