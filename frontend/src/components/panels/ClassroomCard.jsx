import {
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

function ClassroomCard({ classroom, onOpen }) {
  const statusColor =
    classroom.status === "Online"
      ? "success"
      : classroom.status === "Standby"
        ? "warning"
        : classroom.status === "Sleep"
          ? "info"
          : "error";

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: 3,
      }}
    >
      <CardActionArea
        onClick={() => onOpen(classroom)}
        sx={{ height: "100%" }}
      >
        <CardContent>
          <Stack spacing={1.5}>
            <Typography variant="h5">
              {classroom.classroom}
            </Typography>

            <Typography color="text.secondary">
              {classroom.screenName}
            </Typography>

            <Chip
              label={classroom.status}
              color={statusColor}
              sx={{ alignSelf: "flex-start" }}
            />

            <Typography>
              Power: {classroom.power}
            </Typography>

            <Typography>
              Volume: {classroom.volume}
            </Typography>

            <Typography>
              Source: {classroom.source}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Last updated: {classroom.lastPolled}
            </Typography>

            <Button variant="contained">
              View Details
            </Button>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default ClassroomCard;
