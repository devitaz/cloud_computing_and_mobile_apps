import os
import time
import webbrowser

url = "www.assignment2-1.z9cqkpjzc2.us-west-2.elasticbeanstalk.com"

getStudent = "/student"						#	GET all students
getClass = "/class"							#	GET all courses
student = "/student-lookup?student_id=3"	#	GET student with id=3
#	PUT a new student in database
addStudent = "/add-student?student_id=5&name=Christopher"
#	POST update to student name
update = "/update-student?student_id=5&name=Deshawna"	
#	DELETE student from database
deleteStudent = "/remove-student?student_id=5"

print("The first query will display all students in the database via a GET request, and delete any student with the ID=5 so that it can be used for test queries")
raw_input("Press Enter to load the first query. Leave the brower open for subsequent queries.")
webbrowser.open_new(url+deleteStudent)
time.sleep(.5)
webbrowser.open_new_tab(url+getStudent)

print("\nThe next query display all the classes and their instructors in the database via a GET request")
raw_input("Press Enter to load the next query")
webbrowser.open_new_tab(url+getClass)

print("\nThe next query display an individual student stored in the database using a GET request. The student has been queried by his/her student id number")
raw_input("Press Enter to load the next query")
webbrowser.open_new_tab(url+student)

print("\nThe next query will add a new student named Christopher to the 'student' database via a PUT request. A second query which displays all students will show that he is in fact in the database")
raw_input("Press Enter to load the next query")
webbrowser.open_new_tab(url+addStudent)
time.sleep(3)
webbrowser.open_new_tab(url+getStudent)

print("\nThe next query will change the name of the student with ID=5 via a POST request")
raw_input("Press Enter to load the next query")
webbrowser.open_new_tab(url+update)
time.sleep(.5)
webbrowser.open_new_tab(url+getStudent)

print("\nThe last query will delete the student with ID=5 from the database via a DELETE request")
raw_input("Press Enter to load the last query")
webbrowser.open_new_tab(url+deleteStudent)
time.sleep(.5)
webbrowser.open_new_tab(url+getStudent)
