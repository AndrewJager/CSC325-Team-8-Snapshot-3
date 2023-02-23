


// I am not naming this "Class", even if that's valid
class Course {
    static tableName = 'Courses'; // For some reason, I need to declare this a static here, but redeclare it later

    constructor(dept, code, semester) {
        this.dept = dept;
        this.code = code;
        this.semester = semester;
        this.tableName = 'Courses';
    }

    saveToDB(db) {
        let c = 'INSERT INTO ' + this.tableName + '(dept, code, semester)'
        + ' VALUES($dept, $code, $semester);'
        db.run(c,
            {
                $dept: this.dept,
                $code: this.code,
                $semester: this.semester
            });
    }

    static getAllCourses(db) {
        return new Promise((resolve, reject)=>{
            var courses = [];
            db.all('SELECT dept, code, semester FROM ' + this.tableName, 
            {}, 
            (err, rows) => {
                rows.forEach((row) => {
                    courses.push(new Course(row.dept, row.code, row.semester));
                });
                resolve(courses);
            });
        });
    }

    static deleteCourse(db, dept, code, semester) {
        db.run('DELETE FROM ' + this.tableName
            + ' WHERE dept = $dept'
            + ' AND code = $code'
            + ' AND semester = $semester',
            {
                $dept: dept,
                $code: code,
                $semester: semester
            });
    }
}

module.exports = Course;