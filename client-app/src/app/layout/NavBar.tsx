import { observer } from "mobx-react-lite";
import { Button, Container, Dropdown, DropdownMenu, Image, Menu } from "semantic-ui-react";
import { Link, NavLink } from "react-router-dom";
import { useStore } from "../stores/store";

export default observer(function NavBar() {
    const {userStore: {user, logout, isLoggedIn}} = useStore();

    return (
        <Menu inverted fixed="top">
            <Container>
                <Menu.Item header as={NavLink} to='/'>
                    <img src="/assets/logo.png" alt="Logo" style={{marginRight: 10}} />
                    Reactivities
                </Menu.Item>
                {isLoggedIn && 
                    <>
                        <Menu.Item name="Activities" as={NavLink} to='/activities' />
                        <Menu.Item name="Errors" as={NavLink} to='/errors' />
                        <Menu.Item>
                            <Button positive content='Create Activity' as={NavLink} to='/createActivity' />
                        </Menu.Item>
                        <Menu.Item position="right">
                            <Image src={user?.image || '/assets/user.png'} avatar spaced='right' />
                            <Dropdown pointing='top left' text={user?.displayName}>
                                <DropdownMenu>
                                    <Dropdown.Item as={Link} to={`/profile/${user?.username}`} text='My profile' icon='user' />
                                    <Dropdown.Item onClick={logout} icon='power' text='Logout' />
                                </DropdownMenu>
                            </Dropdown>
                        </Menu.Item>
                    </>
                }
            </Container>
        </Menu>
    )
})