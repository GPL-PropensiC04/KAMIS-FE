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
import { faCircleUser, faUsers, faScrewdriverWrench, faFile, faBagShopping, faRightFromBracket, faChartSimple, faMoneyBill,
    faTruck, faBars, faUpload, faHelmetSafety, faBoxesStacked, faEye, faEyeSlash, faCaretRight, faCaretLeft, faGear, faTasks, 
<<<<<<< HEAD
    faChartLine, faShoppingCart, faDollarSign, faChartColumn, faChartPie, 
    faScaleBalanced} from '@fortawesome/free-solid-svg-icons'
=======
    faChartLine, faShoppingCart, faDollarSign, faChartColumn, faChartPie } from '@fortawesome/free-solid-svg-icons'
>>>>>>> 174c36aa3298e6b0d381c9151a95d913d2157db0


// Debug FontAwesome icons
console.log('Loading FontAwesome icons:', {
    shoppingCart: Boolean(faShoppingCart), 
    dollarSign: Boolean(faDollarSign),
    chartColumn: Boolean(faChartColumn),
    chartPie: Boolean(faChartPie)
})

// Tambahkan ikon ke library
library.add(faCircleUser, faUsers, faScrewdriverWrench, faFile, faBagShopping, faRightFromBracket, faChartSimple, faTasks,
    faTruck, faBars, faUpload, faHelmetSafety, faBoxesStacked, faEye, faEyeSlash, faCaretRight, faCaretLeft, faGear, faMoneyBill, 
<<<<<<< HEAD
    faChartLine, faShoppingCart, faDollarSign, faChartColumn, faChartPie,faScaleBalanced)
=======
    faChartLine, faShoppingCart, faDollarSign, faChartColumn, faChartPie)
>>>>>>> 174c36aa3298e6b0d381c9151a95d913d2157db0

// Verify FontAwesome icons are loaded
console.log('FontAwesome icons loaded:', {
    shoppingCart: !!faShoppingCart, 
    dollarSign: !!faDollarSign,
    chartColumn: !!faChartColumn,
    chartPie: !!faChartPie
})

// ===========================

const app = createApp(App)

// Register global komponen FontAwesome
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(Toast)
app.use(createPinia())
app.use(router)

app.mount('#app')
