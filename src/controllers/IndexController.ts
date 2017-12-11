import {Controller, Render, Get, Post, CookieParam} from "routing-controllers";

@Controller()
export default class UserController {
    @Get('/')
    @Render('index')
    getAll(@CookieParam('lang') language: string) {
       return {
         studOrgs: [],
         stats: {participants: 10, studorgs: 10},
         config: global.Backend.Config,
         userLanguage: language,
         locale: global.Backend.Localization[language || 'fi']
       }
    }

}