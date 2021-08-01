import React from 'react';

function BuyUsernameNFT() {
    const handleOnClick = () => { alert("Coming soon!")};

    return (
        <>
            <input
                type="button"
                className="button primary"
                value={`Buy username NFT`}
                onClick={handleOnClick}
            />
        </>
    );
}

export default BuyUsernameNFT;
