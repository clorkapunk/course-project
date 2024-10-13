import {useTranslation} from "react-i18next";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import logo from '@/../public/vite.svg'
import {
    NavigationMenu,
    NavigationMenuItem,
} from "@/components/ui/navigation-menu.tsx";
import {Link, useNavigate} from "react-router-dom";
import { HOME_ROUTE, LOGIN_ROUTE} from "@/utils/routes.ts";
import {useLogoutMutation} from "@/features/auth/authApiSlice.ts";
import {useSelector} from "react-redux";
import {selectAuthState} from "@/features/auth/authSlice.ts";

const availableLanguages = ['en', 'ru']

const Header = () => {
    const {t, i18n} = useTranslation();
    const navigate = useNavigate()
    const [logout] = useLogoutMutation()
    const authState = useSelector(selectAuthState)

    const signOut = async () => {
        await logout({})
        navigate(LOGIN_ROUTE)
    }

    return (
        <div className={'h-[80px] w-full bg-primary p-4 px-10 flex items-center justify-between'}>


            <nav className={'flex items-center gap-10'}>
                <img
                    alt={'logo'}
                    src={logo}
                />
                {
                    authState?.token &&
                    <NavigationMenu className={'list-none gap-4'}>
                        <NavigationMenuItem>
                            <Link to={HOME_ROUTE}>
                                <Button variant={'secondary'}>
                                    Home
                                </Button>
                            </Link>
                        </NavigationMenuItem>


                    </NavigationMenu>
                }

            </nav>


            <nav className={'flex items-center gap-4'}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="default"
                            className={'border'}
                            size={'sm'}
                        >
                            {i18n.language.toUpperCase()}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>{t("select-language")}</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <DropdownMenuRadioGroup
                            value={i18n.language}
                            onValueChange={(value) => i18n.changeLanguage(value)}
                        >
                            {
                                availableLanguages.map((language) => (
                                    <DropdownMenuRadioItem
                                        key={language}
                                        value={language}
                                    >
                                        {t(language)}
                                    </DropdownMenuRadioItem>
                                ))
                            }
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button
                    onClick={signOut}
                    variant={'default'}
                    className={'border'}
                    size={'sm'}
                >
                    Logout
                </Button>
            </nav>

        </div>
    );
};

export default Header;
