/**
 * @swagger
 * components:
 *   schemas:
 *     CoupounCode:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: "The name of the coupon code."
 *           example: "10OFF"
 *         value:
 *           type: number
 *           description: "The value of the coupon."
 *           example: 10
 *         minAmount:
 *           type: number
 *           description: "The minimum amount required for the coupon to be valid."
 *           example: 50
 *         maxAmount:
 *           type: number
 *           description: "The maximum amount up to which the coupon is applicable."
 *           example: 100
 *         shopId:
 *           type: string
 *           description: "The ID of the shop associated with the coupon."
 *           example: "1234567890"
 *         selectedProduct:
 *           type: string
 *           description: "The selected product for which the coupon is applicable."
 *           example: "Shirt"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: "The date and time when the coupon was created."
 *           example: "2024-04-29T12:00:00Z"
 *           readOnly: true
 *       required:
 *         - name
 *         - value
 *         - shopId
 *       additionalProperties: false
 *     Event:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: "The name of the event product."
 *           example: "Music Festival"
 *         description:
 *           type: string
 *           description: "The description of the event product."
 *           example: "Three-day music festival featuring various artists."
 *         category:
 *           type: string
 *           description: "The category of the event product."
 *           example: "Music"
 *         start_Date:
 *           type: string
 *           format: date-time
 *           description: "The start date of the event."
 *           example: "2024-05-01T00:00:00Z"
 *         finish_Date:
 *           type: string
 *           format: date-time
 *           description: "The finish date of the event."
 *           example: "2024-05-03T23:59:59Z"
 *         status:
 *           type: string
 *           description: "The status of the event."
 *           example: "Running"
 *         tags:
 *           type: string
 *           description: "Tags associated with the event."
 *           example: "music, festival"
 *         originalPrice:
 *           type: number
 *           description: "The original price of the event product."
 *           example: 100
 *         discountPrice:
 *           type: number
 *           description: "The discounted price of the event product."
 *           example: 80
 *         stock:
 *           type: number
 *           description: "The stock quantity of the event product."
 *           example: 1000
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: "Images of the event product."
 *           example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *         shopId:
 *           type: string
 *           description: "The ID of the shop associated with the event."
 *           example: "1234567890"
 *         shop:
 *           type: object
 *           description: "Details of the shop associated with the event."
 *           example: { name: "Example Shop", location: "Example City" }
 *         sold_out:
 *           type: number
 *           description: "The quantity of the event product sold out."
 *           example: 500
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: "The date and time when the event product was created."
 *           example: "2024-04-29T12:00:00Z"
 *           readOnly: true
 *       required:
 *         - name
 *         - description
 *         - category
 *         - start_Date
 *         - Finish_Date
 *         - discountPrice
 *         - stock
 *         - shopId
 *         - shop
 *       additionalProperties: false
 *     Order:
 *       type: object
 *       properties:
 *         cart:
 *           type: array
 *           items:
 *             type: object
 *           description: "Items in the order cart."
 *           example: [{ productId: "12345", quantity: 2 }, { productId: "67890", quantity: 1 }]
 *         shippingAddress:
 *           type: object
 *           description: "The shipping address for the order."
 *           example: { street: "123 Main St", city: "Example City", country: "Example Country" }
 *         user:
 *           type: object
 *           description: "Details of the user who placed the order."
 *           example: { userId: "abc123", name: "John Doe" }
 *         totalPrice:
 *           type: number
 *           description: "The total price of the order."
 *           example: 150
 *         status:
 *           type: string
 *           description: "The status of the order."
 *           example: "Processing"
 *         paymentInfo:
 *           type: object
 *           description: "Payment information for the order."
 *           properties:
 *             id:
 *               type: string
 *               description: "The payment ID."
 *             status:
 *               type: string
 *               description: "The payment status."
 *             type:
 *               type: string
 *               description: "The payment type."
 *           example: { id: "xyz789", status: "Paid", type: "Credit Card" }
 *         paidAt:
 *           type: string
 *           format: date-time
 *           description: "The date and time when the order was paid."
 *           example: "2024-04-29T12:00:00Z"
 *           readOnly: true
 *         deliveredAt:
 *           type: string
 *           format: date-time
 *           description: "The date and time when the order was delivered."
 *           example: "2024-05-01T12:00:00Z"
 *           readOnly: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: "The date and time when the order was created."
 *           example: "2024-04-29T12:00:00Z"
 *           readOnly: true
 *       required:
 *         - cart
 *         - shippingAddress
 *         - user
 *         - totalPrice
 *         - status
 *         - paymentInfo
 *       additionalProperties: false
 *     Product:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: "The name of the product."
 *           example: "T-Shirt"
 *         description:
 *           type: string
 *           description: "The description of the product."
 *           example: "Comfortable cotton t-shirt in various colors."
 *         category:
 *           type: string
 *           description: "The category of the product."
 *           example: "Clothing"
 *         tags:
 *           type: string
 *           description: "Tags associated with the product."
 *           example: "t-shirt, cotton, clothing"
 *         originalPrice:
 *           type: number
 *           description: "The original price of the product."
 *           example: 20
 *         discountPrice:
 *           type: number
 *           description: "The discounted price of the product."
 *           example: 15
 *         stock:
 *           type: number
 *           description: "The stock quantity of the product."
 *           example: 100
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: "Images of the product."
 *           example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *         reviews:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               user:
 *                 type: object
 *                 description: "Details of the user who submitted the review."
 *               rating:
 *                 type: number
 *                 description: "The rating given by the user."
 *               comment:
 *                 type: string
 *                 description: "The comment provided by the user."
 *               productId:
 *                 type: string
 *                 description: "The ID of the product being reviewed."
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *                 description: "The date and time when the review was submitted."
 *                 example: "2024-04-29T12:00:00Z"
 *           description: "Reviews of the product."
 *         ratings:
 *           type: number
 *           description: "The overall rating of the product."
 *           example: 4.5
 *         shopId:
 *           type: string
 *           description: "The ID of the shop associated with the product."
 *           example: "1234567890"
 *         shop:
 *           type: object
 *           description: "Details of the shop associated with the product."
 *           example: { name: "Example Shop", location: "Example City" }
 *         sold_out:
 *           type: number
 *           description: "The quantity of the product sold out."
 *           example: 50
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: "The date and time when the product was created."
 *           example: "2024-04-29T12:00:00Z"
 *           readOnly: true
 *       required:
 *         - name
 *         - description
 *         - category
 *         - discountPrice
 *         - stock
 *         - shopId
 *         - shop
 *       additionalProperties: false
 *     Shop:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: "The name of the shop."
 *           example: "Example Shop"
 *         email:
 *           type: string
 *           description: "The email address of the shop."
 *           example: "shop@example.com"
 *         description:
 *           type: string
 *           description: "The description of the shop."
 *         address:
 *           type: string
 *           description: "The address of the shop."
 *           example: "123 Main St"
 *         phoneNumber:
 *           type: number
 *           description: "The phone number of the shop."
 *           example: 1234567890
 *         role:
 *           type: string
 *           description: "The role of the shop."
 *           example: "Seller"
 *         avatar:
 *           type: string
 *           description: "The avatar URL of the shop."
 *           example: "https://example.com/avatar.jpg"
 *         zipCode:
 *           type: number
 *           description: "The zip code of the shop."
 *           example: 12345
 *         withdrawMethod:
 *           type: object
 *           description: "The withdrawal method of the shop."
 *         availableBalance:
 *           type: number
 *           description: "The available balance of the shop."
 *           example: 1000
 *         transections:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: "The amount of the transaction."
 *                 example: 100
 *               status:
 *                 type: string
 *                 description: "The status of the transaction."
 *                 example: "Processing"
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *                 description: "The date and time when the transaction was created."
 *                 example: "2024-04-29T12:00:00Z"
 *               updatedAt:
 *                 type: string
 *                 format: date-time
 *                 description: "The date and time when the transaction was last updated."
 *                 example: "2024-04-29T12:00:00Z"
 *           description: "Transactions of the shop."
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: "The date and time when the shop was created."
 *           example: "2024-04-29T12:00:00Z"
 *           readOnly: true
 *         resetToken:
 *           type: string
 *           description: "The reset token for the shop's password reset."
 *         resetTokenExpiration:
 *           type: string
 *           format: date-time
 *           description: "The expiration date and time of the reset token."
 *           example: "2024-05-01T12:00:00Z"
 *       required:
 *         - name
 *         - email
 *         - password
 *         - address
 *         - phoneNumber
 *         - avatar
 *         - zipCode
 *       additionalProperties: false
 *     User:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: "The name of the user."
 *           example: "John Doe"
 *         email:
 *           type: string
 *           description: "The email address of the user."
 *           example: "user@example.com"
 *         password:
 *           type: string
 *           description: "The password of the user."
 *           minLength: 6
 *         phoneNumber:
 *           type: number
 *           description: "The phone number of the user."
 *         addresses:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               country:
 *                 type: string
 *                 description: "The country of the address."
 *               city:
 *                 type: string
 *                 description: "The city of the address."
 *               address1:
 *                 type: string
 *                 description: "The first line of the address."
 *               address2:
 *                 type: string
 *                 description: "The second line of the address."
 *               zipCode:
 *                 type: number
 *                 description: "The ZIP code of the address."
 *               addressType:
 *                 type: string
 *                 description: "The type of the address."
 *           description: "Addresses of the user."
 *         role:
 *           type: string
 *           description: "The role of the user."
 *           example: "user"
 *         avatar:
 *           type: string
 *           description: "The avatar URL of the user."
 *           example: "https://example.com/avatar.jpg"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: "The date and time when the user was created."
 *           example: "2024-04-29T12:00:00Z"
 *           readOnly: true
 *         resetToken:
 *           type: string
 *           description: "The reset token for the user's password reset."
 *         resetTokenExpiration:
 *           type: string
 *           format: date-time
 *           description: "The expiration date and time of the reset token."
 *           example: "2024-05-01T12:00:00Z"
 *       required:
 *         - name
 *         - email
 *         - password
 *         - avatar
 *       additionalProperties: false
 *     Withdraw:
 *       type: object
 *       properties:
 *         seller:
 *           type: object
 *           description: "Details of the seller initiating the withdrawal."
 *           example: { sellerId: "abc123", name: "John Doe" }
 *         amount:
 *           type: number
 *           description: "The amount to be withdrawn."
 *           example: 100
 *         status:
 *           type: string
 *           description: "The status of the withdrawal."
 *           example: "Processing"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: "The date and time when the withdrawal was initiated."
 *           example: "2024-04-29T12:00:00Z"
 *           readOnly: true
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: "The date and time when the withdrawal was last updated."
 *           example: "2024-04-29T12:00:00Z"
 *       required:
 *         - seller
 *         - amount
 *       additionalProperties: false
 */