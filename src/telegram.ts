import axios from 'axios'
export async function sendTelegramNotification(message: string): Promise<void> {
    const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`
    const data = {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
    }
    try {
        await axios.post(url, data)
        console.log('Telegram notification sent successfully')
    } catch (error) {
        console.error('Failed to send Telegram notification:', error)
    }
}

// Example usage
sendTelegramNotification('Hope you have a great day!')
