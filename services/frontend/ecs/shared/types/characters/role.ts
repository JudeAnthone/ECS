


export interface role {
    role: "Admin" | AuthorizedUsers | "Member"
}

type ProjectChair = {
    ProjectChair: "Community Development and Extension Program" | "Gender Development" | "Alumni Affairs"
}

type ProjectHead = {
    Colleges: "College of Computing Studies" |
              "College of Criminal Justice Education" |
              "College of Industrial Technology" | 
              "College of Hospitality and Tourism Management" |
              "College of Engineering" |
              "College of Education" |
              "College of Business and Public Administration" |
              "College of Arts and Sciences" |
              "College of Architecture and Fine Arts" |
              "Graduate School"
}

type AuthorizedUsers = {
    ProjectChair: ProjectChair
    ProjectHead: ProjectHead
    Staff: "Administrative Staff"
}