import './assets/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// === Font Awesome Setup ===
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCircleUser, faUsers, faScrewdriverWrench, faFile, faBagShopping, faRightFromBracket, faChartSimple, 
    faTruck, faBars, faUpload, faHelmetSafety, faBoxesStacked, faEye, faEyeSlash, faCaretRight, faCaretLeft } from '@fortawesome/free-solid-svg-icons'


// Tambahkan ikon ke library
library.add(faCircleUser, faUsers, faScrewdriverWrench, faFile, faBagShopping, faRightFromBracket, faChartSimple,
    faTruck, faBars, faUpload, faHelmetSafety, faBoxesStacked, faEye, faEyeSlash, faCaretRight, faCaretLeft)

// ===========================

const app = createApp(App)

// Register global komponen FontAwesome
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(Toast)
app.use(createPinia())
app.use(router)

app.mount('#app')
