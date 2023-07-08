import { observer } from "mobx-react-lite";
import { Button, Container, Menu } from "semantic-ui-react";
import { NavLink } from "react-router-dom";

export default observer(function NavBar() {
    return (
        <Menu inverted fixed="top">
            <Container>
                <Menu.Item header as={NavLink} to='/'>
                    <img src="/assets/logo.png" alt="Logo" style={{marginRight: 10}} />
                    Reactivities
                </Menu.Item>
                <Menu.Item name="Activities" as={NavLink} to='/activities' />
                <Menu.Item name="Errors" as={NavLink} to='/errors' />
                <Menu.Item>
                    <Button positive content='Create Activity' as={NavLink} to='/createActivity' />
                </Menu.Item>
            </Container>
        </Menu>
    )
})