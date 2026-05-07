// /guidelines redirects to /listing-guidelines (canonical)
export { default } from './listing-guidelines';

export async function getServerSideProps() {
    return {
        redirect: {
            destination: '/listing-guidelines',
            permanent: true, // 301
        },
    };
}
