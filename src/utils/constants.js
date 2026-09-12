//here we keep some of the imp thing as const ans passing them as a object
export const UserRolesEnum={
    ADMIN:"admin",
    PROJECT_ADMIN:"project_admin",
    MEMBER:"member"
}

//the same above thing we passing as an array
export const AvailableUserRole=Object.values(UserRolesEnum)

export const TaskStatusEnum={
    TODO:"todo",
    IN_PROGRESS:"in_progress",
    DONE:"done"
}

export const AvailableTaskStatues=Object.values(TaskStatusEnum)