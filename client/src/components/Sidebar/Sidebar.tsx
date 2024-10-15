import {Button} from "@/components/ui/button.tsx";
import {Link, useNavigate} from "react-router-dom";
import {HOME_ROUTE, LOGIN_ROUTE, ADMIN_USERS_ROUTE, ADMIN_HISTORY_ROUTE} from "@/utils/routes.ts";
import logo from '../../../public/vite.svg'
import {
    FaAnglesLeft,
    FaGlobe,
    FaHouse,
    FaRightFromBracket,
    FaRightToBracket,
    FaUsersGear
} from "react-icons/fa6";
import {Separator} from "@/components/ui/separator.tsx";
import React, {useState} from "react";
import {useSelector} from "react-redux";
import {selectAuthState} from "@/features/auth/authSlice.ts";
import Roles from "@/utils/roles.ts";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip.tsx";
import styles from "./Sidebar.module.scss";
import {useTranslation} from "react-i18next";
import useIsMobile from "@/hooks/useIsMobile.ts";
import {useLogoutMutation} from "@/features/auth/authApiSlice.ts";
import {FaHistory} from "react-icons/fa";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";


const availableLanguages = ['en', 'ru']
const Sidebar = () => {
    const authState = useSelector(selectAuthState)
    const [isOpened, setIsOpened] = useState<boolean>(true);
    const {t, i18n} = useTranslation()
    const navigate = useNavigate()
    const isMobile = useIsMobile()
    const [logout] = useLogoutMutation()

    const sidebarItems = [
        {
            title: t('menu'),
            isAuth: false,
            roles: [],
            options: [
                {
                    type: "button",
                    route: HOME_ROUTE,
                    label: t('home'),
                    icon: <FaHouse/>
                }
            ]
        },
        {
            title: t('admin'),
            isAuth: true,
            roles: [Roles.Admin],
            options: [
                {
                    type: "button",
                    route: ADMIN_USERS_ROUTE,
                    label: t('users'),
                    icon: <FaUsersGear/>
                },
                {
                    type: "button",
                    route: ADMIN_HISTORY_ROUTE,
                    label: t('history'),
                    icon: <FaHistory/>
                }
            ]
        }

    ]

    const signOut = async () => {
        await logout({})
        navigate(LOGIN_ROUTE)
    }

    return (
        <nav
            className={`${styles.container} ${!isOpened && styles.closed}`}
        >
            <div>
                <div className={`${styles.header} ${!isOpened && styles.closed}`}>
                    <img
                        className={`${styles.logo} ${!isOpened && styles.closed}`}
                        src={logo}
                        alt={'logo'}
                    />
                    <Button
                        onClick={() => setIsOpened(!isOpened)}
                        variant={"ghost"}
                        size={'icon'}
                        className={styles.openButton}
                    >
                        <FaAnglesLeft className={`${styles.icon} ${!isOpened && styles.closed}`}/>
                    </Button>
                </div>
                {
                    sidebarItems.map(section => {
                            if (section.isAuth && !section.roles.some(role => role === authState?.role)) return;
                            return (
                                <React.Fragment key={section.title}>
                                    <Separator orientation={'horizontal'} className={'bg-zinc-600'}/>
                                    <div className={`${styles.section} ${!isOpened && styles.closed}`}>
                                        <h3 className={`${styles.title} ${!isOpened && styles.closed}`}>
                                            {section.title}
                                        </h3>
                                        <ul className={'flex flex-col gap-2'}>
                                            {
                                                section.options.map(item => {
                                                    if (item.type === "button") {
                                                        return (<li key={item.label}>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Link to={item.route}>
                                                                            <Button
                                                                                className={`${styles.button} ${!isOpened && styles.closed}`}
                                                                                variant={'ghost'}>
                                                                                <div className={'text-xl'}>
                                                                                    {item.icon}
                                                                                </div>
                                                                                {isOpened && item.label}
                                                                            </Button>
                                                                        </Link>
                                                                    </TooltipTrigger>

                                                                    <TooltipContent side={'right'} hidden={isOpened}>
                                                                        <p>{item.label}</p>
                                                                    </TooltipContent>

                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </li>)
                                                    }
                                                })
                                            }
                                        </ul>
                                    </div>
                                </React.Fragment>
                            )
                        }
                    )
                }
            </div>

            <div className={styles.bottomContainer}>
                <TooltipProvider>

                    <DropdownMenu>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="default"
                                        className={styles.langButton}
                                        size={'sm'}
                                    >
                                        <FaGlobe className={`${isOpened ? "block" : "hidden"}`}/>
                                        {i18n.language.toUpperCase()}
                                    </Button>
                                </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <DropdownMenuContent className={`${styles.langMenu}`}>
                                <DropdownMenuLabel
                                    className={'text-zinc-200 bg-zinc-800'}>{t("select-language")}</DropdownMenuLabel>
                                <DropdownMenuSeparator className={'bg-zinc-600'}/>
                                <DropdownMenuRadioGroup
                                    value={i18n.language}
                                    onValueChange={(value) => i18n.changeLanguage(value)}
                                >
                                    {
                                        availableLanguages.map((language) => (
                                            <DropdownMenuRadioItem
                                                className={styles.option}
                                                key={language}
                                                value={language}
                                            >
                                                {t(language)}
                                            </DropdownMenuRadioItem>
                                        ))
                                    }
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                            <TooltipContent side={'right'} hidden={isOpened}>
                                <p>{t('language')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </DropdownMenu>
                </TooltipProvider>


                {
                    authState?.token ?
                        <div className={`${styles.userContainer} ${!isOpened && styles.closed}`}>
                            {
                                isOpened &&
                                <div className={'flex flex-col w-[75%]'}>
                                    <p className={`${styles.username} ${!isOpened && styles.closed}`}>{authState.username}</p>
                                    <p className={`${styles.email} ${!isOpened && styles.closed}`}>{authState.email}</p>
                                </div>
                            }
                            <Button
                                onClick={signOut}
                                className={`${styles.button} ${!isOpened && styles.closed}`}
                                variant={'ghost'}
                                size={'icon'}
                            >
                                <FaRightFromBracket/>
                            </Button>
                        </div>
                        :
                        <div className={`${styles.loginContainer} ${!isOpened && styles.close}`}>
                            <Button
                                onClick={() => {
                                    navigate(LOGIN_ROUTE)
                                    console.log(isMobile)
                                    if (isMobile) setIsOpened(false)
                                }}
                                className={`${styles.button} ${!isOpened && styles.closed}`}
                                size={'icon'}
                                variant={'ghost'}
                            >
                                {
                                    isOpened
                                        ? t("sign-in")
                                        :
                                        <div className={'text-xl'}>
                                            <FaRightToBracket/>
                                        </div>
                                }

                            </Button>

                        </div>

                }
            </div>


        </nav>
    );
};

export default Sidebar;
