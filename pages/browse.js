// /browse → redirect to /directory
export async function getServerSideProps(context) {
    const { query } = context;
    const params = new URLSearchParams(query).toString();
    return {
        redirect: {
            destination: `/directory${params ? `?${params}` : ''}`,
            permanent: true,
        },
    };
}

export default function BrowsePage() {
    return null;
}
