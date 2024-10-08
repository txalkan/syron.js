import { NextPage } from 'next'

const Page: NextPage = () => {
    const pdfFile = '/pdfs/leaderboard.pdf'
    return (
        <div>
            <embed
                src={pdfFile}
                style={{ marginTop: '22px' }}
                width="100%"
                height="900px"
                type="application/pdf"
            />
        </div>
    )
}

export default Page
