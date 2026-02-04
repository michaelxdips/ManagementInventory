export const getWIBDate = () => {
    // Returns YYYY-MM-DD in Asia/Jakarta (WIB) timezone
    // 'en-CA' locale forces YYYY-MM-DD format
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
};
