import {useGetUsersQuery} from "@/features/users/usersApiSlice.ts";

const Users = () => {
    const {data: users} = useGetUsersQuery({})

    return (
        <article>
            <h2>Users List</h2>
            {users?.length
                ? (
                    <ul>
                        {users.map((user: any, i: number) => <li key={i}>{user?.email}</li>)}
                    </ul>
                ) : <p>No users to display</p>
            }
        </article>
    );
};

export default Users;
