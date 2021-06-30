import React from 'react';
import TravelRule from '../SSIPassport/travelRule';
import Permawallet from '../Permawallet';
import { useSelector } from '../../context';

function CreateAccount({
  username,
  domain
}: { username: string, domain: string }) {
	const { travelRule } = useSelector((state) => state.user);

	return (
		<div id="main">
			<section style={{ width: '100%' }}>
				<ol>
					<li style={{ marginTop: '4%' }}>{<TravelRule />}</li>
					<li style={{ marginTop: '6%' }}>
						<Permawallet
							{...{
								travelRule
							}}
						/>
					</li>
				</ol>
			</section>
		</div>
  );
}

export default CreateAccount;
