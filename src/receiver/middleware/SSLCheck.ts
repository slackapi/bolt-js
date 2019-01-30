
export default function (): any {
  return (req, res, next) => {
    if (req.body && req.body.ssl_check) {
      return res.send();
    }

    next();
  };
}
